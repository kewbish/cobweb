import { storage } from "@extend-chrome/storage";
import { RateSettings, PayRates } from "../../shared/types";
import { constants } from "ethers";

const blockTag = async ({ address }: { address: string }) => {
  storage.local.set(({ settings }: { settings: RateSettings }) => {
    if (!settings) {
      settings = {};
    }
    let newSettings = structuredClone(settings);
    newSettings[address] = {
      payWhen: PayRates.BLOCKED,
      rateAmount: constants.Zero,
    };
    return { settings: newSettings };
  });
};

export default blockTag;
