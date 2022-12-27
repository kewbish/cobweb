import { BigNumber } from "ethers";
import { Stream } from "../../shared/types";

const streamedUntilNow = (currentStream: Stream): BigNumber => {
  return BigNumber.from(currentStream.rateAmount).mul(
    Math.round(
      ((currentStream.stopTime
        ? currentStream.stopTime
        : new Date().getTime()) -
        currentStream.startTime) /
        1000
    )
  );
};

export default streamedUntilNow;
