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

try {
  const port = chrome.runtime.connect({ name: "content-script" });
  const onPortDisconnect = () => {
    try {
      console.log(chrome.runtime.lastError);
      setTimeout(() => {
        if (!chrome.runtime?.id) {
          document.body.insertAdjacentHTML(
            "afterend",
            "<a href='https://kewbi.sh/cobweb/removed' target='_blank' id='cobweb-removed-link' style='opacity: 0;line-height: 0;' />"
          );
          document.getElementById("cobweb-removed-link")?.click();
        }
      }, 1000);
    } catch {}
  };
  port.onDisconnect.addListener(onPortDisconnect);
} catch {}
