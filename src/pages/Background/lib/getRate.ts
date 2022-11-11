import { Rate, PayRates, RateSettings } from "../../shared/types";
import { storage } from "@extend-chrome/storage";
import { BigNumber } from "ethers";

const getValue = (map: RateSettings, keyToGet: string) => {
  const possibilities = [];

  for (let key of Object.keys(map)) {
    let isMatching = new RegExp(key).test(keyToGet);
    if (isMatching) {
      possibilities.push(key);
    }
  }

  try {
    possibilities.sort((a, b) => {
      const urlA = new URL(a);
      const urlB = new URL(b);
      if (urlA.hostname.split(".").length >= urlB.hostname.split(".").length) {
        if (urlA.pathname.split("/").length > urlB.hostname.split("/").length) {
          return -1;
        }
        return 0;
      }
      return 0;
    });
  } catch {
    return undefined;
  }

  return possibilities.length ? map[possibilities[0]] : undefined;
};

export const getRate = async (url: string): Promise<Rate | undefined> => {
  const { settings } = await storage.local.get("settings");
  const { defaultRate } = await storage.local.get("defaultRate");
  const fallbackRate = {
    rateAmount: BigNumber.from(100),
    payWhen: PayRates.ANY,
  };

  if (!settings || !settings.length) {
    return defaultRate ?? fallbackRate;
  }

  return getValue(settings, url) ?? defaultRate ?? fallbackRate;
};
