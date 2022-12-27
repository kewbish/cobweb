// @ts-expect-error
import { v5 as fromString } from "uuid";
import NAMESPACE from "./secrets.uuid";
import { BigNumber, Signer, utils } from "ethers";
import { Stream } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { InfuraProvider } from "@ethersproject/providers";
import errorToast, { toast } from "../../shared/toast";
import {
  pendingMonetization,
  startMonetization,
  stopMonetization,
} from "../../shared/monetization";
import TOKEN_MAP from "../../shared/tokens";

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
  /*
  const possibleName = await infuraProvider.resolveName(to);
  if (!possibleName || !utils.isAddress(to)) {
    return;
  }

  if (possibleName) {
    to = possibleName;
  } else {
    to = utils.getAddress(to);
  }

  const response = await fetch(
    "https://cobweb-worker.kewbish.workers.dev/get?" +
      new URLSearchParams({ address: to })
  );
  const responseJson = await response.json();
  if (responseJson.error) {
    return;
  } else if (!responseJson.valid) {
    // hasn't been added to Cobweb network
    return;
  }
  */

  const uuid = fromString(
    to + tabId.toString() + new Date().toString(),
    NAMESPACE
  );
  chrome.scripting.executeScript({
    args: [to, uuid],
    target: { tabId },
    func: pendingMonetization,
    world: "MAIN",
  });

  let newStream = null;

  /*
  try {
    if (
      (
        await sf.cfaV1.getFlow({
          sender: from,
          receiver: to,
          providerOrSigner: sfSigner,
          superToken: sfToken.address,
        })
      ).flowRate === "0"
      // no other existing stream
    ) {
      const newStreamOperation = sf.cfaV1.createFlowByOperator({
        sender: from,
        flowRate: rateAmount.toString(),
        receiver: to,
        superToken: sfToken.address,
        userData: `${to} ${new Date()}`,
      });
      newStream = await newStreamOperation.exec(sfSigner);
    }
  } catch (e) {
    chrome.scripting.executeScript({
      args: [to, uuid],
      target: { tabId },
      func: stopMonetization,
    world: "MAIN",
    });
    errorToast(e as Error);
    toast(
      "Check that you've approved enough spending tokens in your account page."
    );
  }*/

  const { streams } = await storage.local.get("streams");

  storage.local.set({
    streams: [
      ...streams,
      {
        recipient: to,
        tabId,
        rateAmount,
        requestId: uuid,
        startTime: new Date().getTime(),
        token: {
          name: sfToken.name,
          decimals: 18, // TODO - hardcoding for now
          symbol: sfToken.symbol,
          xAddress: sfToken.address,
        },
        url,
      },
    ],
  });

  chrome.scripting.executeScript({
    args: [to, uuid],
    target: { tabId },
    func: startMonetization,
    world: "MAIN",
  });
  return newStream;
};

export const updateStream = async ({
  from,
  to,
  tabId,
  rateAmount,
  sf,
  sfSigner,
  sfToken,
}: {
  from: string;
  to: string;
  tabId: number;
  rateAmount: BigNumber;
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
}) => {
  const uuid = fromString(
    to + tabId.toString() + new Date().toString(),
    NAMESPACE
  );
  chrome.scripting.executeScript({
    args: [to, uuid],
    target: { tabId },
    func: pendingMonetization,
    world: "MAIN",
  });

  let updateStream;
  try {
    const updateStreamOperation = sf.cfaV1.updateFlowByOperator({
      sender: from,
      flowRate: rateAmount.toString(),
      receiver: to,
      superToken: sfToken.address,
      userData: `${to} ${new Date()}`,
    });
    updateStream = await updateStreamOperation.exec(sfSigner);
  } catch (e) {
    errorToast(e as Error);
  }

  const { streams } = await storage.local.get("streams");

  storage.local.set({
    streams: [
      ...streams.map((stream: Stream) =>
        stream.tabId !== tabId ? stream : { ...stream, rateAmount }
      ),
    ],
  });
  chrome.scripting.executeScript({
    args: [to, uuid],
    target: { tabId },
    func: (to, uuid) => startMonetization,
    world: "MAIN",
  });
  return updateStream;
};

export default createStream;
