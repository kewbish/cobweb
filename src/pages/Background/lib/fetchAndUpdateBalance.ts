import { storage } from "@extend-chrome/storage";
import { Web3Provider } from "@ethersproject/providers";
import { SuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, constants, utils } from "ethers";

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
      !addressRes ||
      !utils.getAddress(addressRes) ||
      (await mmProvider.resolveName(addressRes))
    ) {
      throw new Error("Wallet address is invalid.");
    }

    let address = addressRes;
    if (await mmProvider.resolveName(addressRes)) {
      address = await mmProvider.resolveName(addressRes);
    } else {
      address = utils.getAddress(addressRes);
    }

    if (!cwInitialized) {
      const balance = await mmProvider.getBalance(address);
      storage.local.set({ balance: BigNumber.from(balance) });

      return;
    }

    ({ availableBalance, deposit } = await sfToken.realtimeBalanceOf({
      account: address,
      providerOrSigner: mmProvider,
    }));
    balanceRes = BigNumber.from(availableBalance);
    storage.local.set({ balance: balanceRes });
  } catch (e) {
    // document.monetization = "stopped";
    throw e;
  }
  if (balanceRes.eq(constants.Zero)) {
    return;
  }
  if (balanceRes.gt(constants.Zero) && balanceRes.lte(deposit)) {
    // critical balance
    throw new Error("Balance is critically low");
  }

  let defaultRate: BigNumber | null = null;
  try {
    // low balance == less than 12h's worth of default stream rate
    ({ defaultRate } = await storage.local.get("defaultRate"));
    if (balanceRes.lte(BigNumber.from(defaultRate).mul(BigNumber.from(12)))) {
      throw new Error("Balance is low.");
    }
  } catch (e) {
    throw e;
  }
};

export default fetchAndUpdateBalance;
