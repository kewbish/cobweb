import React, { useEffect, useState } from "react";
import { BigNumber, constants, ethers } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import { useNavigate } from "react-router-dom";
import { FETCH_BALANCE } from "../shared/events";
import CobwebPage from "./components/CobwebPage";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import TOKEN_MAP from "../shared/tokens";

const ManageBalances = () => {
  const [balance, setBalance] = useState(constants.Zero);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );

  useEffect(() => {
    const balance = new bootstrap.Popover(document.getElementById("balance"));
    return () => {
      balance.dispose();
    };
  }, []);

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

  return (
    <CobwebPage>
      <>
        <h2 className="mb-0">Balance</h2>
        <hr className="my-1" />
        <h1
          className="display"
          style={{
            fontSize: "8vw",
            fontWeight: 200,
            marginBottom: 0,
          }}
          id="balance"
          data-bs-toggle="popover"
          data-bs-trigger="hover focus"
          data-bs-template={
            '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
          }
          data-bs-placement="bottom"
          data-bs-content={
            ethers.utils.formatUnits(balance) + " " + TOKEN_MAP.ETH.name
          }
        >
          {(+ethers.utils.formatUnits(balance)).toFixed(4)}{" "}
          {/*sfToken.name*/ "ETHx"}
        </h1>
        <p>available to spend.</p>
        <div className="d-flex justify-content-evenly gap-2">
          <button
            type="button"
            className="btn p-1 glassy-cw-btn"
            onClick={() => navigate("/balance/upgrade")}
          >
            Upgrade more tokens
          </button>
          <button
            type="button"
            className="btn p-1 glassy-cw-btn"
            onClick={() => navigate("/balance/downgrade")}
          >
            Downgrade tokens
          </button>
        </div>
      </>
    </CobwebPage>
  );
};

export default ManageBalances;
