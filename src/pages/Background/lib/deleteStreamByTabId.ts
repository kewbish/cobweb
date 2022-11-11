import {
  MonetizationPending,
  MonetizationStop,
} from "../../shared/monetization";
import { PayRates, Stream, Wallet } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";

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
      document.monetization = "pending";
      document.monetization.dispatchEvent(
        new MonetizationPending({
          paymentPointer: stream.recipient,
          requestId: stream.requestId,
        })
      );
      throw e;
    }
  };

  const { streams } = await storage.local.get("streams");

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

  document.monetization = "stopped";
  document.monetization.dispatchEvent(
    new MonetizationStop({
      paymentPointer: stream.recipient,
      requestId: stream.requestId,
      finalized: true,
    })
  );
};

export default deleteStreamByTabId;
