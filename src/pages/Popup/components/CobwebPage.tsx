import React from "react";
import BackgroundBox from "./BackgroundBox";
import ProfilePic from "./ProfilePic";
import { ethers, BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FETCH_BALANCE } from "../../shared/events";
import FadedPill from "./FadedPill";
import TOKEN_MAP from "../../shared/tokens";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

const CobwebPage = ({ children }: { children: React.ReactNode }) => {
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
  }, [balanceRes]);

  const navigate = useNavigate();

  useEffect(() => {
    new bootstrap.Popover(document.getElementById("popover"));
  }, []);

  return (
    <div className="mx-2 my-3 p-0">
      <div className="container">
        <div className="d-flex justify-content-between align-items-start">
          <h1
            className="display"
            style={{ fontSize: 40, fontWeight: 600, cursor: "pointer" }}
            onClick={() => navigate(-1)}
          >
            &lt;
          </h1>
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
        </div>
        <BackgroundBox>
          <>{children}</>
        </BackgroundBox>
      </div>
    </div>
  );
};

export default CobwebPage;
