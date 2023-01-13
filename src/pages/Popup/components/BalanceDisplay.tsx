import React, { useEffect, useState } from "react";
import { BigNumber, constants } from "ethers";
import { FETCH_BALANCE } from "../../shared/events";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import FadedPill from "./FadedPill";
import TOKEN_MAP from "../../shared/tokens";
import ProfilePic from "./ProfilePic";
import { ethers } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";

const BalanceDisplay = () => {
  const [mmAddress, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );

  const [balance, setBalance] = useState(constants.Zero);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );

  useEffect(() => {
    chrome.runtime.sendMessage({
      message: FETCH_BALANCE,
    });
  }, []);

  useEffect(() => {
    if (!balanceRes) {
      return;
    }

    setBalance(BigNumber.from(balanceRes));
    const popover = document.getElementById("popover");
    let updatedPopover: any = null;
    if (popover) {
      popover.title =
        ethers.utils.formatUnits(balanceRes) + " " + TOKEN_MAP.ETH.name;
      updatedPopover = bootstrap.Popover.getOrCreateInstance(popover);
    }
    return () => {
      updatedPopover?.dispose();
    };
  }, [balanceRes]);

  useEffect(() => {
    const popover = new bootstrap.Popover(document.getElementById("popover"));
    return () => {
      popover.dispose();
    };
  }, []);

  return (
    <div
      style={{ marginTop: "-10px" }}
      id="popover"
      data-bs-toggle="popover"
      title={ethers.utils.formatUnits(balance) + " " + TOKEN_MAP.ETH.name}
      data-bs-trigger="hover focus"
      data-bs-template={
        '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
      }
    >
      <FadedPill>
        <div className="d-flex justify-content-end align-items-center h-auto">
          <div
            className="d-flex align-items-center"
            style={{ marginRight: "5px" }}
          >
            <p className="align-self-center m-0">
              {ethers.utils.formatUnits(balance.sub(balance.mod(1e12)))}{" "}
              {TOKEN_MAP.ETH.name}
            </p>
          </div>
          <ProfilePic width={40} address={mmAddress} />
        </div>
      </FadedPill>
    </div>
  );
};

export default React.memo(BalanceDisplay);
