import { SuperToken, WrapperSuperToken } from "@superfluid-finance/sdk-core";
import { BigNumber, Signer } from "ethers";
import errorToast from "../../shared/toast";

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
      amount: downgrading.toString(),
    });
    await downgradeTokenOperation.exec(sfSigner);
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
    const upgradeTokenOperation = (sfToken as WrapperSuperToken).downgrade({
      amount: upgrading.toString(),
    });
    await upgradeTokenOperation.exec(sfSigner);
  } catch (e) {
    errorToast(e as Error);
  }
};
