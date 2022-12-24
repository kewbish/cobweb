import { PayRates, Stream, Wallet } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";
import errorToast from "../../shared/toast";
import { stopMonetization } from "../../shared/monetization";

const deleteStreamByTabId = async ({
  tabId,
  sf,
  sfSigner,
  sfToken,
  checkFocus = false,
}: {
  tabId: number;
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
  checkFocus?: boolean;
}) => {
  const cancelStream = async (recipient: string) => {
    const { wallet }: { wallet: Wallet } = await storage.local.get("wallet");
    try {
      const deleteStreamOperation = sf.cfaV1.deleteFlow({
        sender: wallet.address,
        receiver: recipient,
        superToken: sfToken.address,
      });
      await deleteStreamOperation.exec(sfSigner);
    } catch (e) {
      chrome.scripting.executeScript({
        args: [stream.recipient, stream.requestId],
        target: { tabId },
        func: stopMonetization,
      });
      errorToast(e as Error);
    }
  };

  const { streams } = await storage.local.get("streams");

  if (!streams) {
    return;
  }

  const stream = streams.find((stream: Stream) => stream.tabId === tabId);

  if (!stream) {
    return;
  }

  if (checkFocus && streams.pay !== PayRates.FOCUS) {
    return;
  }

  storage.local.set({
    streams: streams.filter((stream: Stream) => stream.tabId !== tabId),
  });

  cancelStream(stream.recipient);

  chrome.scripting.executeScript({
    args: [stream.recipient, stream.requestId],
    target: { tabId },
    func: stopMonetization,
  });
};

export default deleteStreamByTabId;
