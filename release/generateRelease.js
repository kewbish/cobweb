const fs = require("fs");
const { exit } = require("process");
const semver = require("semver");
const shell = require("shelljs");
const cheerio = require("cheerio");
const process = require("node:process");

if (process.cwd() !== "/home/kewbish/Downloads/dev/cobweb-rise") {
  console.log("cd to project root first.");
  exit(1);
}

// increment version numbers in package.json and manifest.json
const rawdata = fs.readFileSync("package.json");
const packageJson = JSON.parse(rawdata);
const rawdataManifest = fs.readFileSync("src/manifest.json");
const manifestJson = JSON.parse(rawdataManifest);

const lastVersion = packageJson.version;
const newVersion = semver.inc(
  lastVersion,
  process.argv.length > 3 ? process.argv[3] : "patch"
);
packageJson.version = newVersion;
manifestJson.version = newVersion;

fs.writeFileSync("package.json", JSON.stringify(packageJson));
fs.writeFileSync("src/manifest.json", JSON.stringify(manifestJson));

// build extension
let { code } = shell.exec("NODE_ENV=production npm run build");
if (code !== 0) {
  console.error("NPM build script failed.");
  exit(1);
}

// pack extension
({ code } = shell.exec(
  "google-chrome-stable --pack-extension=build --pack-extension-key=/home/kewbish/Documents/chrome-extensions.pem"
));
if (code !== 0) {
  console.error("Packing extension failed.");
  exit(1);
}
shell.mv("build.crx", "cobweb.crx");

// zip extension to Downloads folder
({ code } = shell.exec("zip /home/kewbish/Downloads/build.zip -r build"));
if (code !== 0) {
  console.error("Zipping extension failed.");
  exit(1);
}

// get extension checksum
let stdout;
({ code, stdout } = shell.exec('sha256sum cobweb.crx | cut -d " " -f 1 '));
if (code !== 0) {
  console.error("Packing extension failed.");
  exit(1);
}
const checksum = stdout.trim();

// write to landing page HTML
const rawhtml = fs.readFileSync("landing/index.html");
const $ = cheerio.load(rawhtml);
$('code[style="word-break: break-all"]').text(checksum);
fs.writeFileSync("landing/index.html", $.html());

// update release notes
let rawMD = fs.readFileSync("release/RELEASE_NOTES.md").toString();
rawMD = rawMD.replace("%%CHECKSUM%%", checksum);
rawMD = rawMD.replace(
  "%%CHANGELOG%%",
  `https://github.com/kewbish/cobweb/compare/v${lastVersion}...v${newVersion}`
);
fs.writeFileSync("release/RELEASE_NOTES.md", rawMD);

console.log(`Remember to tag releases: git tag v${newVersion}`);
