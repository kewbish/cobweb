import { storage } from "@extend-chrome/storage";
import { RateSettings, PayRates } from "../../shared/types";
import { constants } from "ethers";

const blockSite = ({ site }: { site: string }) => {
  storage.local.set(({ settings }: { settings: RateSettings }) => {
    settings[site] = { payWhen: PayRates.BLOCKED, rateAmount: constants.Zero };
    return settings;
  });
};

export default blockSite;
