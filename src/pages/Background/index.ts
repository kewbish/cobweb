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
  BLOCK_TAG,
  UPDATE_SETTING,
  UPDATE_STREAM,
  FETCH_BALANCE,
  APPROVE_AMT,
  DOWNGRADE_TOKEN,
  UPGRADE_TOKEN,
  NEW_TOAST,
  FETCH_SIGNATURE,
  CHECK_METAMASK,
  APPROVE_FULL,
} from "../shared/events";
import TOKEN_MAP, { PROD_TOKEN_MAP } from "../shared/tokens";
import { PayRates, Wallet } from "../shared/types";
import createStream, { updateStream } from "./lib/createStream";
import deleteStreamByTabId from "./lib/deleteStreamByTabId";
import setNewWallet from "./lib/setNewWallet";
import { getRate } from "./lib/getRate";
import setDefaultSettings from "./lib/initializeCobweb";
import blockTag from "./lib/blockTag";
import updateRateSetting from "./lib/updateRateSetting";
import fetchAndUpdateBalance from "./lib/fetchAndUpdateBalance";
import setNewAddress from "./lib/updateAddress";
import approveAmt, { approveAll } from "./lib/approveAmt";
import { downgradeTokens, upgradeTokens } from "./lib/wrapTokens";
import setNewToast, { deleteToast } from "./lib/setNewToast";
import errorToast, { toast } from "../shared/toast";
import generateSignature from "./lib/generateSignature";
import verifySignature from "../shared/verifySignature";
import cleanUpStreams from "./lib/cleanUpStreams";
import fetchCobwebAllowance from "./lib/fetchCobwebAllowance";
import { isDev } from "./lib/isDev";

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    setDefaultSettings();
    chrome.runtime.setUninstallURL("https://kewbi.sh/cobweb/removed");
  }
});

let metamaskProvider: MetaMaskInpageProvider | null = null;
metamaskProvider = createMetaMaskProvider();
storage.local.set({ mmNotFound: false });

metamaskProvider?.on("error", (error) => {
  storage.local.set({ mmNotFound: true });
});

metamaskProvider.on("disconnect", () => {
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
if (!addressTry || addressTry === "NO_ADDRESS") {
  storage.local.set({
    address: metamaskProvider.selectedAddress ?? "NO_ADDRESS",
  });
}

let infuraProvider: InfuraProvider | null = null;
try {
  infuraProvider = new ethers.providers.InfuraProvider(
    isDev() ? "goerli" : "homestead",
    {
      projectId: INFURA_PROJECT_ID,
      projectSecret: INFURA_PROJECT_SECRET,
    }
  );
} catch (e) {
  toast("Error - failed to initialize provider");
  throw new Error("Error - failed to initialize provider");
}
let sf: Framework | null = null;
try {
  sf = await Framework.create({
    chainId: isDev() ? 5 : 1,
    provider: infuraProvider,
  });
} catch (e) {
  errorToast(e as Error);
  throw e;
}

let sfToken: SuperToken | null = null;
try {
  if (sf) {
    sfToken = await sf.loadSuperToken(
      isDev() ? TOKEN_MAP.ETH.xAddress : PROD_TOKEN_MAP.ETH.xAddress
    );
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
    // throw e;
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
  if (!address || !walletRes || !sfSigner || !sf) {
    return;
  }
  const tabId = sender.tab.id ?? 0;
  const rate = await getRate(address);
  if (rate.payWhen === PayRates.BLOCKED) {
    return;
  }
  const { address: mmAddress } = (await storage.local.get("address")) ?? {
    address: "",
  };
  createStream({
    from: mmAddress,
    toTag: request.options.address,
    to: address,
    tabId,
    url: sender.tab.url ?? "",
    rateAmount: rate.rateAmount,
    sf,
    sfSigner,
    sfToken,
    infuraProvider: infuraProvider as InfuraProvider,
    mmSigner: mmProvider.getSigner(),
  });
  cleanUpStreams({ sfSigner, sfToken, sf, mmSigner: mmProvider.getSigner() });
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
      mmSigner: mmProvider.getSigner(),
    });
  }
};

const setUserWallet = async ({ request }: { request: any }) => {
  setNewWallet(request.options.wallet);
};

const setBlockTag = async ({ request }: { request: any }) => {
  blockTag({
    address: request.options.address,
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
    mmSigner: mmProvider.getSigner(),
  });
};

const fetchBalance = async () => {
  const { signer: sfSigner } = await getWalletAndSigner();
  const { cwInitialized } = (await storage.local.get("cwInitialized")) as {
    cwInitialized: boolean | null;
  };
  if (!sfToken || !mmProvider || !sf || (cwInitialized && !sfSigner)) {
    return;
  }
  fetchAndUpdateBalance({ sfToken, mmProvider, sfSigner, sf });
};

const approveAmount = async ({ request }: { request: any }) => {
  const sfSigner = mmProvider.getSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  await approveAmt({
    depositAmt: request.options.depositAmt,
    sf,
    sfSigner,
    sfToken,
  });
};

const approveFull = async () => {
  const sfSigner = mmProvider.getSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  await approveAll({
    sf,
    sfSigner,
    sfToken,
  });
};

const downgradeTokenAmount = async ({ request }: { request: any }) => {
  const sfSigner = mmProvider.getSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  downgradeTokens({
    sfToken,
    downgrading: request.options.downgrading,
    sfSigner,
  });
};

const upgradeTokenAmount = async ({ request }: { request: any }) => {
  const sfSigner = mmProvider.getSigner();
  if (!sf || !sfToken || !sfSigner) {
    return;
  }
  upgradeTokens({
    sfToken,
    upgrading: request.options.upgrading,
    sfSigner,
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
    case BLOCK_TAG: {
      setBlockTag({ request });
      sendResponse();
      return;
    }
    case UPDATE_SETTING: {
      updateSetting({ request });
      sendResponse();
      return;
    }
    case UPDATE_STREAM: {
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
    case APPROVE_FULL:
      approveFull();
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
    deleteStreamByTabId({
      tabId,
      sf,
      sfSigner,
      sfToken,
      mmSigner: mmProvider.getSigner(),
    });
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, _) => {
  if (changeInfo.status !== "complete") {
    return;
  }
  const { signer: sfSigner } = await getWalletAndSigner();
  if (changeInfo.url && sf && sfSigner && sfToken) {
    deleteStreamByTabId({
      tabId,
      sf,
      sfSigner,
      sfToken,
      checkFocus: true,
      mmSigner: mmProvider.getSigner(),
    });
  }
});

let alarmSuffix = 0;
chrome.runtime.onStartup.addListener(() => {
  alarmSuffix = Date.now();
});
chrome.alarms.create("cobwebStreamCleanup" + alarmSuffix, {
  delayInMinutes: 5,
});
chrome.alarms.create("cobwebAllowanceCheck" + alarmSuffix, {
  delayInMinutes: 5,
});
chrome.alarms.onAlarm.addListener(async (alarm) => {
  try {
    var parsedName = alarm.name.match(/^([\S\s]*?)(\d+)$/);
    let name = "";
    let suffix = 0;
    if (parsedName) {
      name = parsedName[0];
      suffix = +parsedName[1];
    }
    if (suffix !== alarmSuffix) {
      return;
    }
    const { wallet, signer: sfSigner } = await getWalletAndSigner();
    if (!sf || !sfSigner || !sfToken) {
      return;
    }
    if (name === "cobwebStreamCleanup") {
      cleanUpStreams({
        sfSigner,
        sfToken,
        sf,
        mmSigner: mmProvider.getSigner(),
      });
    } else if (name === "cobwebAllowanceCheck") {
      const { address } = await storage.local.get("address");
      if (!wallet || !address) {
        return;
      }
      fetchBalance();
      fetchCobwebAllowance({
        sfToken,
        sfSigner,
        sf,
        walletAddress: wallet.address,
        mmAddress: address,
      });
    }
  } catch {}
});

chrome.runtime.onConnect.addListener(() => {});
