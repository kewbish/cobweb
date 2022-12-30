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

const createStream = async ({
  from,
  to,
  toTag,
  tabId,
  url,
  rateAmount,
  sf,
  sfToken,
  infuraProvider,
  mmSigner,
}: {
  from: string;
  to: string;
  toTag: string;
  tabId: number;
  url: string;
  rateAmount: BigNumber;
  sf: Framework;
  sfToken: SuperToken;
  infuraProvider: InfuraProvider;
  mmSigner: Signer;
}) => {
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
      new URLSearchParams({ address: to.toLowerCase() }).toString()
  );
  const responseJson = await response.json();
  if (responseJson.error) {
    return;
  } else if (!responseJson.valid) {
    // hasn't been added to Cobweb network
    return;
  }

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

  try {
    if (
      (
        await sf.cfaV1.getFlow({
          sender: from,
          receiver: to,
          providerOrSigner: mmSigner,
          superToken: sfToken.address,
        })
      ).flowRate === "0"
      // no other existing stream
    ) {
      const newStreamOperation = sf.cfaV1.createFlow({
        sender: from,
        flowRate: BigNumber.from(rateAmount).toString(),
        receiver: to,
        superToken: sfToken.address,
        userData: utils.hexlify(utils.toUtf8Bytes(`${to} ${new Date()}`)),
      });
      newStream = await newStreamOperation.exec(mmSigner);

      const { streams } = await storage.local.get("streams");

      storage.local.set({
        streams: [
          ...streams,
          {
            recipient: to,
            recipientTag: toTag,
            tabId,
            rateAmount: BigNumber.from(rateAmount),
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
  }
};

export const updateStream = async ({
  from,
  to,
  tabId,
  rateAmount,
  sf,
  sfToken,
  mmSigner,
}: {
  from: string;
  to: string;
  tabId: number;
  rateAmount: BigNumber;
  sf: Framework;
  sfToken: SuperToken;
  mmSigner: Signer;
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
    const updateStreamOperation = sf.cfaV1.updateFlow({
      sender: from,
      flowRate: BigNumber.from(rateAmount).toString(),
      receiver: to,
      superToken: sfToken.address,
      userData: `${to} ${new Date()}`,
    });
    updateStream = await updateStreamOperation.exec(mmSigner);
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
