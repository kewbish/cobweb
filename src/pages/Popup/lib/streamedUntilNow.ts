import { BigNumber } from "ethers";
import { Stream } from "../../shared/types";

const streamedUntilNow = (currentStream: Stream): BigNumber => {
  return currentStream.rateAmount.mul(
    ((currentStream.stopTime ? currentStream.stopTime : new Date()).getTime() -
      currentStream.startTime.getTime()) /
      1000
  );
};

export default streamedUntilNow;
