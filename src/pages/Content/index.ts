import { MONTAG_FOUND } from "../shared/events";

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
  // TODO - replace with more efficient search algorithms
  const bodyText = document.body.innerText;
  const monetizationTagGroups = bodyText.match(/COBWEB:(\s)?(?<address>(\w)+)/)
    ?.groups as { address: string } | null;
  if (monetizationTagGroups) {
    console.log(
      `COBWEB: Monetization Tag Found - ${monetizationTagGroups.address}`
    );
    chrome.runtime.sendMessage({
      message: MONTAG_FOUND,
      options: { address: monetizationTagGroups.address },
    });
  }
}