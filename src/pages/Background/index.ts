// remember to patch MetaMaskInpageProvider
// https://github.com/tsarpaul/citadelnfts-extension/blob/master/patch_metamask_provider.py
import createMetaMaskProvider from "metamask-extension-provider";
import { BigNumber, ethers, constants, Signer } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";
import {
  INFURA_PROJECT_ID,
  INFURA_PROJECT_SECRET,
} from "../shared/secrets.infura";
import { SuperToken } from "@superfluid-finance/sdk-core";
import { InfuraProvider } from "@ethersproject/providers";
import { storage } from "@extend-chrome/storage";

import {
  MONTAG_FOUND,
  USER_SET_WALLET,
  DELETE_STREAM,
  UPDATE_STREAM,
  BLOCK_SITE,
  UPDATE_SETTING,
  EDIT_CURRENT_STREAM,
  FETCH_BALANCE,
  APPROVE_AMT,
  DOWNGRADE_TOKEN,
  UPGRADE_TOKEN,
} from "../shared/events";
import TOKEN_MAP from "../shared/tokens";
import { Wallet } from "../shared/types";
import createStream, { updateStream } from "./lib/createStream";
import deleteStreamByTabId from "./lib/deleteStreamByTabId";
import setNewWallet from "./lib/setNewWallet";
import { getRate } from "./lib/getRate";
import setDefaultSettings from "./lib/initializeCobweb";
import blockSite from "./lib/blockSite";
import updateRateSetting from "./lib/updateRateSetting";
import fetchAndUpdateBalance from "./lib/fetchAndUpdateBalance";
import setNewAddress from "./lib/updateAddress";
import approveAmt from "./lib/approveAmt";
import { downgradeTokens, upgradeTokens } from "./lib/wrapTokens";

const metamaskProvider = createMetaMaskProvider();

if (!metamaskProvider) {
  throw new Error("Metamask not detected");
}

export const mmProvider = new ethers.providers.Web3Provider(
  metamaskProvider as any
);

let walletRes: ethers.Wallet | null = null;
try {
  await storage.local.get("wallet").then(({ wallet }: { wallet: Wallet }) => {
    walletRes = new ethers.Wallet(
      new ethers.utils.SigningKey(wallet.pkey),
      mmProvider
    );
  });
} catch (e) {
  const newWallet = ethers.Wallet.createRandom();
  storage.local.set({
    wallet: {
      address: newWallet.address,
      mnemonic: newWallet.mnemonic,
      pkey: newWallet.privateKey,
    },
  });
  walletRes = new ethers.Wallet(
    new ethers.utils.SigningKey(newWallet.privateKey),
    mmProvider
  );
  throw e;
}

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

let sfSigner: Signer | null = null;
try {
  if (!walletRes) {
    throw new Error("Error - expected wallet.");
  }
  sfSigner = sf.createSigner({
    privateKey: (walletRes as ethers.Wallet).privateKey,
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

const montagFound = async ({
  request,
  sender,
  sendResponse,
}: {
  request: any;
  sender: chrome.runtime.MessageSender;
  sendResponse?: Function;
}) => {
  if (
    !sf ||
    !sfSigner ||
    !sfToken ||
    !infuraProvider ||
    !walletRes ||
    !sender.tab
  ) {
    return;
  }
  const tabId = sender.tab.id ?? 0;
  const url = sender.tab.url ?? "";
  const rate = await getRate(url);
  if (rate && rate.rateAmount !== constants.Zero) {
    createStream({
      from: walletRes.address,
      to: request.options.address,
      tabId,
      url: sender.tab.url ?? sender.tab.pendingUrl ?? "",
      rateAmount: rate.rateAmount,
      sf,
      sfSigner,
      sfToken,
      infuraProvider: infuraProvider as InfuraProvider,
    });
  }
};

const deleteStream = async ({ request }: { request: any }) => {
  if (!sf || !sfSigner || !sfToken) {
    return;
  }
  if (request.options.tabId) {
    deleteStreamByTabId({
      tabId: request.options.tabId,
      sf,
      sfSigner,
      sfToken,
    });
  }
};

const setUserWallet = async ({ request }: { request: any }) => {
  setNewWallet(request.options.wallet);
};

const setBlockSite = async ({ request }: { request: any }) => {
  blockSite({
    site: request.options.site,
  });
};

const updateSetting = async ({ request }: { request: any }) => {
  updateRateSetting({
    oldKey: request.options.oldKey,
    newKey: request.options.newKey,
    rateAmt: BigNumber.from(request.options.rateAmt),
    payWhen: request.options.payWhen,
  });
};

const editCurrentStream = async ({ request }: { request: any }) => {
  if (!sf || !sfSigner || !sfToken) {
    return;
  }
  updateStream({
    from: request.options.from,
    rateAmount: request.options.rateAmount,
    to: request.options.to,
    url: request.options.url,
    tabId: request.options.tabId,
    sf,
    sfSigner,
    sfToken,
  });
};

const fetchBalance = async () => {
  if (!sfToken || !mmProvider) {
    return;
  }
  fetchAndUpdateBalance({ sfToken, mmProvider });
};

const approveAmount = async ({ request }: { request: any }) => {
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  approveAmt({ depositAmt: request.options.depositAmt, sf, sfSigner, sfToken });
};

const downgradeTokenAmount = async ({ request }: { request: any }) => {
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  downgradeTokens({
    downgrading: request.options.downgrading,
    sfSigner,
    sfToken,
  });
};

const upgradeTokenAmount = async ({ request }: { request: any }) => {
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  upgradeTokens({
    upgrading: request.options.upgrading,
    sfSigner,
    sfToken,
  });
};

const handleMessaging = async (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: Function
) => {
  switch (request.message) {
    case MONTAG_FOUND: {
      montagFound({ request, sender, sendResponse });
      sendResponse();
      return;
    }
    case DELETE_STREAM: {
      if (!request.options?.tabId && sender?.tab?.id) {
        deleteStream({ request: { options: { tabId: sender.tab.id } } });
      } else {
        deleteStream({ request });
      }
      sendResponse();
      return;
    }
    case USER_SET_WALLET: {
      setUserWallet({ request });
      sendResponse();
      return;
    }
    case BLOCK_SITE: {
      setBlockSite({ request });
      sendResponse();
      return;
    }
    case UPDATE_SETTING: {
      updateSetting({ request });
      sendResponse();
      return;
    }
    case EDIT_CURRENT_STREAM: {
      editCurrentStream({ request });
      sendResponse();
      return;
    }
    case FETCH_BALANCE: {
      fetchBalance();
      sendResponse();
      return;
    }
    case APPROVE_AMT: {
      approveAmount({ request });
      sendResponse();
      return;
    }
    case DOWNGRADE_TOKEN: {
      downgradeTokenAmount({ request });
      sendResponse();
      return;
    }
    case UPGRADE_TOKEN: {
      upgradeTokenAmount({ request });
      sendResponse();
      return;
    }
    default:
      sendResponse();
      return;
  }
};

chrome.runtime.onMessage.addListener(handleMessaging);

chrome.tabs.onRemoved.addListener(async (tabId, _) => {
  if (sf && sfSigner && sfToken) {
    deleteStreamByTabId({ tabId, sf, sfSigner, sfToken });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _) => {
  if (changeInfo.url && sf && sfSigner && sfToken) {
    deleteStreamByTabId({ tabId, sf, sfSigner, sfToken });
  }
});

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    setDefaultSettings();
  }
});

metamaskProvider.on("accountsChanged", (accounts) => {
  setNewAddress({
    address: (accounts as Array<string>)[0],
    provider: mmProvider,
  });
});
