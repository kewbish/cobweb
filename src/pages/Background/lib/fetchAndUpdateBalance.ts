import { storage } from "@extend-chrome/storage";
import { Web3Provider } from "@ethersproject/providers";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, constants, Signer, utils } from "ethers";
import errorToast, { toast } from "../../shared/toast";
import { DELETE_STREAM } from "../../shared/events";
import { Rate } from "../../shared/types";
import cleanUpStreams from "./cleanUpStreams";

const fetchAndUpdateBalance = async ({
  sf,
  sfToken,
  mmProvider,
}: {
  sf: Framework;
  sfToken: SuperToken;
  mmProvider: Web3Provider;
}) => {
  let availableBalance: string | null = null;
  let deposit: string | null = null;
  let balanceRes: BigNumber | null = null;
  try {
    const { cwInitialized }: { cwInitialized: boolean } =
      await storage.local.get("cwInitialized");
    const { address: addressRes } = await storage.local.get("address");

    // check address is valid
    if (
      cwInitialized &&
      (!addressRes ||
        !utils.getAddress(addressRes) ||
        !(await mmProvider.resolveName(addressRes)))
    ) {
      toast("Wallet address is invalid");
      return;
    }

    let address = addressRes;
    if (await mmProvider.resolveName(addressRes)) {
      address = await mmProvider.resolveName(addressRes);
    } else {
      address = utils.getAddress(addressRes);
    }

    const balance = await mmProvider.getBalance(address);
    storage.local.set({ mmBalance: BigNumber.from(balance) });

    const mmSigner = mmProvider.getSigner();

    if (!cwInitialized || !mmSigner) {
      return;
    }

    ({ availableBalance, deposit } = await sfToken.realtimeBalanceOf({
      account: address,
      providerOrSigner: mmProvider,
    }));
    balanceRes = BigNumber.from(availableBalance);
  } catch (e) {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    if (tab?.id) {
      chrome.runtime.sendMessage({
        message: DELETE_STREAM,
        options: {
          tabId: tab.id,
        },
      });
    }
    errorToast(e as Error);
  }
  if (!balanceRes || !deposit) {
    toast("Wallet balance could not be fetched");
    return;
  } else {
    storage.local.set({ balance: balanceRes });
  }
  if (balanceRes.eq(constants.Zero)) {
    return;
  }
  if (balanceRes.gt(constants.Zero) && balanceRes.lte(deposit)) {
    // critical balance
    toast("Balance is critically low");
    if (sf && mmProvider) {
      cleanUpStreams({
        sf,
        sfToken,
        all: true,
        mmSigner: mmProvider.getSigner(),
      });
    }
    return;
  }

  let defaultRate: Rate | null = null;
  try {
    // low balance == less than 3h's worth of default stream rate
    ({ defaultRate } = await storage.local.get("defaultRate"));
    if (
      defaultRate?.rateAmount &&
      balanceRes.lte(
        BigNumber.from(defaultRate.rateAmount).mul(BigNumber.from(3))
      )
    ) {
      toast("Balance is low.");
      return;
    }
  } catch (e) {
    errorToast(e as Error);
  }
};

export default fetchAndUpdateBalance;
