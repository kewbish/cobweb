import { PayRates, Stream, Wallet } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";
import errorToast from "../../shared/toast";

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
      const deleteStreamOperation = sf.cfaV1.deleteFlowByOperator({
        sender: wallet.address,
        receiver: recipient,
        superToken: sfToken.address,
      });
      await deleteStreamOperation.exec(sfSigner);
    } catch (e) {
      errorToast(e as Error);
      return;
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

  // cancelStream(stream.recipient);
};

export default deleteStreamByTabId;
