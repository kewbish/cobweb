// remember to patch MetaMaskInpageProvider
// https://github.com/tsarpaul/citadelnfts-extension/blob/master/patch_metamask_provider.py
import createMetaMaskProvider from "metamask-extension-provider";
import { MetaMaskInpageProvider } from "@metamask/inpage-provider";
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
  BLOCK_SITE,
  UPDATE_SETTING,
  EDIT_CURRENT_STREAM,
  FETCH_BALANCE,
  APPROVE_AMT,
  DOWNGRADE_TOKEN,
  UPGRADE_TOKEN,
  NEW_TOAST,
  FETCH_SIGNATURE,
  CHECK_METAMASK,
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
import setNewToast, { deleteToast } from "./lib/setNewToast";
import errorToast, { toast } from "../shared/toast";
import generateSignature from "./lib/generateSignature";
import verifySignature from "../shared/verifySignature";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    console.log("INSTALLED");
    setDefaultSettings();
  }
});

let metamaskProvider: MetaMaskInpageProvider | null = null;
metamaskProvider = createMetaMaskProvider();
storage.local.set({ mmNotFound: false });

metamaskProvider?.on("error", (error) => {
  storage.local.set({ mmNotFound: true });
});

metamaskProvider.on("accountsChanged", (accounts) => {
  setNewAddress({
    address: (accounts as Array<string>)[0],
    provider: mmProvider,
  });
});

export const mmProvider = new ethers.providers.Web3Provider(
  metamaskProvider as any
);

storage.local.set({ toasts: [] });

let { address: addressTry } = (await storage.local.get("address")) as {
  address: string | null;
};
if (!addressTry) {
  storage.local.set({ address: metamaskProvider.selectedAddress });
}

let infuraProvider: InfuraProvider | null = null;
try {
  infuraProvider = new ethers.providers.InfuraProvider("goerli", {
    projectId: INFURA_PROJECT_ID,
    projectSecret: INFURA_PROJECT_SECRET,
  });
} catch (e) {
  toast("Error - failed to initialize provider");
  throw new Error("Error - failed to initialize provider");
}

let sf: Framework | null = null;
try {
  sf = await Framework.create({
    chainId: 5,
    provider: infuraProvider,
  });
} catch (e) {
  errorToast(e as Error);
  throw e;
}

let sfToken: SuperToken | null = null;
try {
  if (sf) {
    sfToken = await sf.loadSuperToken(TOKEN_MAP.fDAI.name);
  }
} catch (e) {
  errorToast(e as Error);
  throw e;
}

const getWalletAndSigner = async (): Promise<{
  wallet: ethers.Wallet | null;
  signer: Signer | null;
}> => {
  let walletRes: ethers.Wallet | null = null;
  try {
    const { wallet } = (await storage.local.get("wallet")) as {
      wallet: Wallet | null;
    };
    if (wallet) {
      walletRes = new ethers.Wallet(
        new ethers.utils.SigningKey(wallet.pkey),
        mmProvider
      );
    }
  } catch {
    // silently fail
    // throw new Error("Wallet not found, redirecting to onboarding");
    return { wallet: null, signer: null };
  }
  let sfSigner: Signer | null = null;
  try {
    if (!walletRes || !sf || !infuraProvider) {
      // toast("Error - expected wallet.");
      // throw new Error("Error - expected wallet. (H)");
      return { wallet: null, signer: null };
    } else {
      sfSigner = sf.createSigner({
        privateKey: (walletRes as ethers.Wallet).privateKey,
        provider: infuraProvider as InfuraProvider,
      });
    }
  } catch (e) {
    errorToast(e as Error);
    throw e;
  }
  return { wallet: walletRes, signer: sfSigner };
};

const montagFound = async ({
  request,
  sender,
  sendResponse,
}: {
  request: any;
  sender: chrome.runtime.MessageSender;
  sendResponse?: Function;
}) => {
  if (!sf || !sfToken || !infuraProvider || !sender.tab) {
    return;
  }
  const { wallet: walletRes, signer: sfSigner } = await getWalletAndSigner();
  let address = verifySignature(request.options.address);
  if (!address || !walletRes || !sfSigner) {
    return;
  }
  const tabId = sender.tab.id ?? 0;
  const rate = await getRate(address);
  if (rate && rate.rateAmount !== constants.Zero) {
    createStream({
      from: walletRes.address,
      to: address,
      tabId,
      rateAmount: rate.rateAmount,
      sf,
      sfSigner,
      sfToken,
      infuraProvider: infuraProvider as InfuraProvider,
    });
  }
};

const deleteStream = async ({ request }: { request: any }) => {
  const { signer: sfSigner } = await getWalletAndSigner();
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
  const { signer: sfSigner } = await getWalletAndSigner();
  if (!sf || !sfSigner || !sfToken) {
    return;
  }
  updateStream({
    from: request.options.from,
    rateAmount: request.options.rateAmount,
    to: request.options.to,
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
  const { signer: sfSigner } = await getWalletAndSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  approveAmt({ depositAmt: request.options.depositAmt, sf, sfSigner, sfToken });
};

const downgradeTokenAmount = async ({ request }: { request: any }) => {
  const { signer: sfSigner } = await getWalletAndSigner();
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
  const { signer: sfSigner } = await getWalletAndSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  upgradeTokens({
    upgrading: request.options.upgrading,
    sfSigner,
    sfToken,
  });
};

const createNewToast = async ({ request }: { request: any }) => {
  setNewToast(request.options.message);
  setTimeout(() => {
    deleteToast(request.options.message);
  }, 5050);
};

const fetchSignature = async ({
  request,
}: {
  request: any;
}): Promise<String> => {
  const signature = await generateSignature(mmProvider);
  return signature;
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
    case NEW_TOAST: {
      createNewToast({ request });
      sendResponse();
      return;
    }
    case FETCH_SIGNATURE:
      const signature = await fetchSignature({ request });
      sendResponse(signature);
      return;
    case CHECK_METAMASK:
      metamaskProvider = createMetaMaskProvider();
      storage.local.set({ mmNotFound: false }); // optimistically reset
      sendResponse();
      return;
    default:
      sendResponse();
      return;
  }
};

chrome.runtime.onMessage.addListener(handleMessaging);

chrome.tabs.onRemoved.addListener(async (tabId, _) => {
  const { signer: sfSigner } = await getWalletAndSigner();
  if (sf && sfSigner && sfToken) {
    deleteStreamByTabId({ tabId, sf, sfSigner, sfToken });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _) => {
  if (changeInfo.status !== "complete") {
    return;
  }
  const { signer: sfSigner } = await getWalletAndSigner();
  if (changeInfo.url && sf && sfSigner && sfToken) {
    deleteStreamByTabId({ tabId, sf, sfSigner, sfToken });
  }
});
