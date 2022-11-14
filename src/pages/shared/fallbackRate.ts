import { Rate, PayRates } from "./types";
import { BigNumber } from "ethers";

const fallbackRate: Rate = {
  rateAmount: BigNumber.from(100),
  payWhen: PayRates.ANY,
};

export default fallbackRate;
