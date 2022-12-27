import { SuperToken, WrapperSuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, Signer } from "ethers";
import errorToast, { toast } from "../../shared/toast";

export const downgradeTokens = async ({
  sfToken,
  sfSigner,
  downgrading,
}: {
  sfToken: SuperToken;
  sfSigner: Signer;
  downgrading: BigNumber;
}) => {
  try {
    const downgradeTokenOperation = (sfToken as WrapperSuperToken).downgrade({
      amount: BigNumber.from(downgrading).toString(),
    });
    await downgradeTokenOperation.exec(sfSigner);
    toast("Downgraded!");
  } catch (e) {
    errorToast(e as Error);
  }
};

export const upgradeTokens = async ({
  sfToken,
  sfSigner,
  upgrading,
}: {
  sfToken: SuperToken;
  sfSigner: Signer;
  upgrading: BigNumber;
}) => {
  try {
    const upgradeTokenOperation = (sfToken as WrapperSuperToken).upgrade({
      amount: BigNumber.from(upgrading).toString(),
    });
    console.log(upgradeTokenOperation);
    await upgradeTokenOperation.exec(sfSigner);
    toast("Upgraded!");
  } catch (e) {
    errorToast(e as Error);
  }
};
