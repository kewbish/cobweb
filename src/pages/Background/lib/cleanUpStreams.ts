import { storage } from "@extend-chrome/storage";
import { Stream } from "../../shared/types";
import deleteStreamByTabId from "./deleteStreamByTabId";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";

const cleanUpStreams = async ({
  sfSigner,
  sfToken,
  sf,
  all = false,
}: {
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
  all?: boolean;
}) => {
  const { streams }: { streams: Array<Stream> } = await storage.local.get(
    "streams"
  );

  if (!streams) {
    return;
  }

  for (const stream of streams) {
    if (all) {
      deleteStreamByTabId({ tabId: stream.tabId, sf, sfSigner, sfToken });
      continue;
    }
    try {
      await chrome.tabs.get(stream.tabId);
    } catch {
      deleteStreamByTabId({ tabId: stream.tabId, sf, sfSigner, sfToken });
    }
  }
};

export default cleanUpStreams;
