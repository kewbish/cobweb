import { storage } from "@extend-chrome/storage";
import errorToast, { toast } from "../../shared/toast";
import { Framework, SuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, Signer, Wallet } from "ethers";

const approveAmt = async ({
  depositAmt,
  sf,
  sfSigner,
  sfToken,
}: {
  depositAmt: BigNumber;
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
}) => {
  try {
    const { wallet }: { wallet: Wallet } = await storage.local.get("wallet");
    if (!wallet) {
      // throw new Error("Expected wallet.");
      toast("No wallet found");
      throw new Error("Expected wallet.");
    }
    try {
      const updateFlowOperatorOperation =
        sf.cfaV1.updateFlowOperatorPermissions({
          flowOperator: wallet.address,
          permissions: 7,
          flowRateAllowance: BigNumber.from(depositAmt).toString(),
          superToken: sfToken.address,
        });
      await updateFlowOperatorOperation.exec(sfSigner);
      toast("Approved!");
    } catch {
      toast("Error: try a lower amount or try again later.");
    }
  } catch (e) {
    errorToast(e as Error);
    // throw e;
  }
};

export const approveAll = async ({
  sf,
  sfSigner,
  sfToken,
}: {
  sf: Framework;
  sfSigner: Signer;
  sfToken: SuperToken;
}) => {
  try {
    const { wallet }: { wallet: Wallet } = await storage.local.get("wallet");
    if (!wallet) {
      // throw new Error("Expected wallet.");
      toast("No wallet found");
      throw new Error("Expected wallet.");
    }
    try {
      const updateFlowOperatorOperation =
        sf.cfaV1.authorizeFlowOperatorWithFullControl({
          flowOperator: wallet.address,
          superToken: sfToken.address,
        });
      await updateFlowOperatorOperation.exec(sfSigner);
      toast("Approved full authorization!");
    } catch {
      toast("Error: try again later.");
    }
  } catch (e) {
    errorToast(e as Error);
    // throw e;
  }
};

export default approveAmt;
