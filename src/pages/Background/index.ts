// remember to patch MetaMaskInpageProvider
// https://github.com/tsarpaul/citadelnfts-extension/blob/master/patch_metamask_provider.py
import createMetaMaskProvider from "metamask-extension-provider";
import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import {
  INFURA_PROJECT_ID,
  INFURA_PROJECT_SECRET,
} from "../shared/secrets.infura";
import { SuperToken } from "@superfluid-finance/sdk-core";
import { InfuraProvider } from "@ethersproject/providers";

import { MONTAG_FOUND } from "../shared/events";
import TOKEN_MAP from "../shared/tokens";

const metamaskProvider = createMetaMaskProvider();

if (!metamaskProvider) {
  throw new Error("Metamask not detected");
}

export const mmProvider = new ethers.providers.Web3Provider(
  metamaskProvider as any
);

let infuraProvider: InfuraProvider | null = null;
try {
  infuraProvider = new ethers.providers.InfuraProvider("goerli", {
    projectId: INFURA_PROJECT_ID,
    projectSecret: INFURA_PROJECT_SECRET,
  });
} catch {
  throw new Error("Error - failed to initialize provider");
}

let sf: Framework | null = null;
try {
  sf = await Framework.create({
    chainId: 4,
    provider: infuraProvider,
  });
} catch (e) {
  throw e;
}

let sfToken: SuperToken | null = null;
try {
  sfToken = await sf.loadSuperToken(TOKEN_MAP.fDAI.name);
} catch (e) {
  throw e;
}

const handleMessaging = async (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: Function
) => {
  switch (request.message) {
    case MONTAG_FOUND: {
      console.log(`COBWEB: Monetization Tag Found ${request.options.address}`);
      return;
    }
    default:
      return;
  }
};

chrome.runtime.onMessage.addListener(handleMessaging);
