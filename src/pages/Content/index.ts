import { MONTAG_FOUND } from "../shared/events";
import websiteMap from "./websiteMap";

const monetizationTag = document.querySelector(
  "meta[name='monetization']"
) as HTMLMetaElement;
if (monetizationTag) {
  console.log(`COBWEB: Monetization Tag Found ${monetizationTag.content}`);
  chrome.runtime.sendMessage({
    message: MONTAG_FOUND,
    options: { address: monetizationTag.content },
  });
} else {
  const getDomain = (hostname: string) => {
    const hostnames = hostname.split(".");
    hostnames.reverse();
    return `${hostnames[1]}.${hostnames[0]}`;
  };

  const url = document.location.href;
  const reducedHostName = getDomain(new URL(url).hostname);
  let bodyText = null;
  for (const patternString of Object.keys(websiteMap)) {
    const hostName = patternString.split("/")[0];
    if (hostName === reducedHostName) {
      let pathname = undefined;
      if (patternString.includes("/")) {
        pathname = "/" + patternString.split("/").slice(1).join("/");
      }
      // @ts-expect-error
      const pattern = new URLPattern({ pathname });
      if (pattern.match(url)) {
        bodyText = document.querySelectorAll(websiteMap[patternString])[0]
          ?.textContent;
        break;
      }
    }
  }
  if (bodyText === null) {
    bodyText = document.body.innerText;
  }
  const monetizationTagGroups = bodyText.match(/(?<tag>COBWEB:\w+&\w+)/)
    ?.groups as { tag: string } | null;
  if (monetizationTagGroups) {
    console.log(
      `COBWEB: Monetization Tag Found - ${monetizationTagGroups.tag}`
    );
    chrome.runtime.sendMessage({
      message: MONTAG_FOUND,
      options: { address: monetizationTagGroups.tag },
    });
  }
}
