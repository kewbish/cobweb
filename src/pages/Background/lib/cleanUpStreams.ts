import { storage } from "@extend-chrome/storage";
import { Stream } from "../../shared/types";
import deleteStreamByTabId from "./deleteStreamByTabId";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";

const cleanUpStreams = async ({
  sfToken,
  sf,
  all = false,
  mmSigner,
}: {
  sf: Framework;
  sfToken: SuperToken;
  all?: boolean;
  mmSigner: Signer;
}) => {
  const { streams }: { streams: Array<Stream> } = await storage.local.get(
    "streams"
  );

  if (!streams) {
    return;
  }

  for (const stream of streams) {
    if (all) {
      deleteStreamByTabId({
        tabId: stream.tabId,
        sf,
        sfToken,
        mmSigner,
      });
      continue;
    }
    try {
      await chrome.tabs.get(stream.tabId);
    } catch {
      deleteStreamByTabId({
        tabId: stream.tabId,
        sf,
        sfToken,
        mmSigner,
      });
    }
  }
};

export default cleanUpStreams;
