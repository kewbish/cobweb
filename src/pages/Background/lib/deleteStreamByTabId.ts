import { PayRates, Stream } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";
import { unsetBadge } from "./updateExtBadge";

const deleteStreamByTabId = async ({
  tabId,
  sf,
  sfToken,
  checkFocus = false,
  mmSigner,
}: {
  tabId: number;
  sf: Framework;
  sfToken: SuperToken;
  checkFocus?: boolean;
  mmSigner: Signer;
}) => {
  const cancelStream = async (recipient: string) => {
    const { address }: { address: string | null } = await storage.local.get(
      "address"
    );
    if (!address) {
      return;
    }
    try {
      const deleteStreamOperation = sf.cfaV1.deleteFlow({
        sender: address,
        receiver: recipient,
        superToken: sfToken.address,
      });
      await deleteStreamOperation.exec(mmSigner);
    } catch (e) {
      // errorToast(e as Error);
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

  cancelStream(stream.recipient);

  await unsetBadge(tabId);
};

export default deleteStreamByTabId;
