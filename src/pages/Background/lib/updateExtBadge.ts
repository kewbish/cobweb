import { storage } from "@extend-chrome/storage";
import { Stream } from "../../shared/types";

const updateExtBadge = async () => {
  chrome.action.setBadgeBackgroundColor({ color: "#6DB2F2" });

  const { streams }: { streams: Array<Stream> } = await storage.local.get(
    "streams"
  );

  if (!streams) {
    return;
  }

  for (const stream of streams) {
    try {
      await chrome.tabs.get(stream.tabId); // check tab exists
      chrome.action.setBadgeText({ tabId: stream.tabId, text: "active!" });
    } catch {}
  }
};

export const setBadge = async (tabId: number) => {
  try {
    await chrome.tabs.get(tabId); // check tab exists
    chrome.action.setBadgeText({ tabId, text: "active!" });
  } catch {}
};

export const unsetBadge = async (tabId: number) => {
  try {
    await chrome.tabs.get(tabId); // check tab exists
    chrome.action.setBadgeText({ tabId, text: "" });
  } catch {}
};

export default updateExtBadge;
