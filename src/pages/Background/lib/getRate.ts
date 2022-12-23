import { Rate, PayRates } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { BigNumber } from "ethers";

export const getRate = async (address: string): Promise<Rate | undefined> => {
  const { settings } = await storage.local.get("settings");
  const { defaultRate } = await storage.local.get("defaultRate");
  const fallbackRate = {
    rateAmount: BigNumber.from(100),
    payWhen: PayRates.ANY,
  };

  if (!settings || !settings.length) {
    return defaultRate ?? fallbackRate;
  }

  const tryAddress = Object.keys(settings).filter((k) =>
    k.startsWith(`COBWEB:${address}`)
  );

  return settings.get(tryAddress) ?? defaultRate ?? fallbackRate;
};
