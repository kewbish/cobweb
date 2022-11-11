import { storage } from "@extend-chrome/storage";
import { BigNumber } from "ethers";
import { PayRates } from "../../shared/types";

const setDefaultSettings = () => {
  storage.local.set({ streams: [] });
  storage.local.set({
    defaultRate: { rateAmt: BigNumber.from(100), payWhen: PayRates.ANY },
  });
  storage.local.set({ streams: [] });
  storage.local.set({ balance: BigNumber.from(0) });
  storage.local.set({ cwInitialized: true });
};

export default setDefaultSettings;
