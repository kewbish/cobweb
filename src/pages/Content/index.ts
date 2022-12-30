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
