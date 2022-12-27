import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { storage } from "@extend-chrome/storage";
import { BigNumber, Signer } from "ethers";
import errorToast, { toast } from "../../shared/toast";
import { Rate } from "../../shared/types";

const fetchCobwebAllowance = async ({
  sf,
  sfToken,
  mmAddress,
  walletAddress,
  sfSigner,
}: {
  sf: Framework;
  sfToken: SuperToken;
  mmAddress: string;
  walletAddress: string;
  sfSigner: Signer;
}) => {
  let { flowRateAllowance }: { flowRateAllowance: BigNumber | string } =
    await sf.cfaV1.getFlowOperatorData({
      superToken: sfToken.address,
      sender: mmAddress,
      flowOperator: walletAddress,
      providerOrSigner: sfSigner,
    });
  flowRateAllowance = BigNumber.from(flowRateAllowance);

  let { deposit }: { deposit: BigNumber | string } =
    await sf.cfaV1.getAccountFlowInfo({
      superToken: sfToken.address,
      account: mmAddress,
      providerOrSigner: sfSigner,
    });
  deposit = BigNumber.from(deposit);

  if (flowRateAllowance.lte(deposit)) {
    // critical balance
    toast("Allowance critically low - authorize more tokens");
    return;
  }

  let defaultRate: Rate | null = null;
  try {
    // low balance == less than 3h's worth of default stream rate
    ({ defaultRate } = await storage.local.get("defaultRate"));
    if (
      defaultRate?.rateAmount &&
      flowRateAllowance.lte(
        BigNumber.from(defaultRate.rateAmount).mul(BigNumber.from(3))
      )
    ) {
      toast("Allowance low - authorize more tokens.");
      return;
    }
  } catch (e) {
    errorToast(e as Error);
  }
};

export default fetchCobwebAllowance;
