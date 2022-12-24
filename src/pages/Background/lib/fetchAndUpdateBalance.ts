import { storage } from "@extend-chrome/storage";
import { Web3Provider } from "@ethersproject/providers";
import { SuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, constants, utils } from "ethers";
import errorToast, { toast } from "../../shared/toast";

const fetchAndUpdateBalance = async ({
  sfToken,
  mmProvider,
}: {
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
    storage.local.set({ balance: BigNumber.from(balance) });

    if (!cwInitialized) {
      return;
    }
  } catch {}

  // TODO - below is superfluid token amt, let's display that in a different way later
  /*
    ({ availableBalance, deposit } = await sfToken.realtimeBalanceOf({
      account: address,
      providerOrSigner: mmProvider,
    }));
    balanceRes = BigNumber.from(availableBalance);
  } catch (e) {
    // document.monetization = "stopped";
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
    return;
  }

  let defaultRate: BigNumber | null = null;
  try {
    // low balance == less than 12h's worth of default stream rate
    ({ defaultRate } = await storage.local.get("defaultRate"));
    if (balanceRes.lte(BigNumber.from(defaultRate).mul(BigNumber.from(12)))) {
      toast("Balance is low.");
      return;
    }
  } catch (e) {
    errorToast(e as Error);
  }*/
};

export default fetchAndUpdateBalance;
