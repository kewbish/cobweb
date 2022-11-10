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
}
