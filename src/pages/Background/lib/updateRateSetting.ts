import { storage } from "@extend-chrome/storage";
import { PayRates, RateSettings } from "../../shared/types";
import { BigNumber } from "ethers";

const updateRateSetting = ({
  oldKey,
  newKey,
  rateAmt,
  payWhen,
}: {
  oldKey: string;
  newKey: string;
  rateAmt: BigNumber;
  payWhen: PayRates;
}) => {
  storage.local.set(({ settings }: { settings: RateSettings }) => {
    delete settings[oldKey];
    settings[newKey] = { rateAmount: rateAmt, payWhen };
    return settings;
  });
};

export default updateRateSetting;
