import { Rate, PayRates } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { BigNumber } from "ethers";

export const getRate = async (address: string): Promise<Rate> => {
  const { settings } = await storage.local.get("settings");
  const { defaultRate } = await storage.local.get("defaultRate");
  const fallbackRate = {
    rateAmount: BigNumber.from(100),
    payWhen: PayRates.ANY,
  };

  if (!settings || !Object.keys(settings).length) {
    return defaultRate ?? fallbackRate;
  }

  const tryAddress = Object.keys(settings).filter((k) =>
    k.toLowerCase().startsWith(`cobweb:${address.toLowerCase()}`)
  );

  return (
    (tryAddress.length > 0 ? settings[tryAddress[0]] : null) ??
    defaultRate ??
    fallbackRate
  );
};
