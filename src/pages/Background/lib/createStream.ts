import {
  Monetization,
  MonetizationStart,
  MonetizationPending,
  MonetizationStop,
} from "../../shared/monetization";
// @ts-expect-error
import { v5 as fromString } from "uuid";
import NAMESPACE from "./secrets.uuid";
import { BigNumber, Signer, utils } from "ethers";
import { Stream } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { InfuraProvider } from "@ethersproject/providers";

const createStream = async ({
  from,
  to,
  tabId,
  url,
  rateAmount,
  sf,
  sfSigner,
  sfToken,
  infuraProvider,
}: {
  from: string;
  to: string;
  tabId: number;
  url: string;
  rateAmount: BigNumber;
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
  infuraProvider: InfuraProvider;
}) => {
  const possibleName = await infuraProvider.resolveName(to);
  if (!possibleName || !utils.getAddress(to)) {
    return;
  }

  if (possibleName) {
    to = possibleName;
  } else {
    to = utils.getAddress(to);
  }

  document.monetization.state = "pending";
  const uuid = fromString(
    to + tabId.toString() + new Date().toString(),
    NAMESPACE
  );
  document.monetization.dispatchEvent(
    new MonetizationPending({
      paymentPointer: to,
      requestId: uuid,
    })
  );

  let newStream = null;

  try {
    const newStreamOperation = sf.cfaV1.createFlow({
      sender: from,
      flowRate: rateAmount.toString(),
      receiver: to,
      superToken: sfToken.address,
      userData: `${url} ${new Date()}`,
    });
    newStream = await newStreamOperation.exec(sfSigner);
  } catch (e) {
    document.monetization.state = "stopped";
    document.monetization.dispatchEvent(
      new MonetizationStop({
        paymentPointer: to,
        requestId: uuid,
        finalized: true,
      })
    );
    throw e;
  }

  const { streams } = await storage.local.get("streams");

  storage.local.set({
    streams: [
      ...streams,
      {
        recipient: to,
        tabId,
        url,
        rateAmount,
        requestId: uuid,
        startTime: new Date(),
        token: {
          name: sfToken.name,
          decimals: sfToken.contract.decimals(),
          symbol: sfToken.symbol,
          xAddress: sfToken.address,
        },
      },
    ],
  });
  document.monetization.state = "started";
  document.monetization.dispatchEvent(
    new MonetizationStart({
      paymentPointer: to,
      requestId: uuid,
    })
  );
  return newStream;
};

export const updateStream = async ({
  from,
  to,
  tabId,
  url,
  rateAmount,
  sf,
  sfSigner,
  sfToken,
}: {
  from: string;
  to: string;
  tabId: number;
  url: string;
  rateAmount: BigNumber;
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
}) => {
  document.monetization = new Monetization("pending");
  const uuid = fromString(
    to + tabId.toString() + new Date().toString(),
    NAMESPACE
  );
  document.monetization.dispatchEvent(
    new MonetizationPending({
      paymentPointer: to,
      requestId: uuid,
    })
  );

  let updateStream;
  try {
    const updateStreamOperation = sf.cfaV1.updateFlow({
      sender: from,
      flowRate: rateAmount.toString(),
      receiver: to,
      superToken: sfToken.address,
      userData: `${url} ${new Date()}`,
    });
    updateStream = await updateStreamOperation.exec(sfSigner);
  } catch (e) {
    throw e;
  }

  const { streams } = await storage.local.get("streams");

  storage.local.set({
    streams: [
      ...streams.map((stream: Stream) =>
        stream.tabId !== tabId ? stream : { ...stream, rateAmount }
      ),
    ],
  });
  document.monetization.state = "started";
  document.monetization.dispatchEvent(
    new MonetizationStart({
      paymentPointer: to,
      requestId: uuid,
    })
  );
  return updateStream;
};

export default createStream;
