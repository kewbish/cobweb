# Cobweb contributions are welcome!

If you can reproduce a bug or wish to contribute to the codebase, please open an issue or PR.

## Development

1. Clone this repository.
2. `npm install` or `yarn install`.
3. `npm run start` to start the build process and server.
4. Navigate to `chrome://extensions` > `Load unpacked` > select `./build`.

The extension popup (`./src/pages/Popup`) will hot-reload, but changes to the background server (`./src/pages/Background`) will require refreshing the extension on `chrome://extensions`.

## Cutting a release

1. Edit `./release/RELEASE_NOTES.md`, replacing the checksum and full changelog URL with `%%VERSION%%` and `%%CHANGELOG%%`. These will be substituted in by the build script.
2. `cd` to the root of this Git repository.
3. `npm run release`.
4. Run the `git tag` command output by the previous script and push changes.
5. There is a `Create Cobweb Release` GitHub action to automate the rest of the release creation process - this can only be triggered by myself ([Kewbish](https://kewbi.sh)) at this time.
