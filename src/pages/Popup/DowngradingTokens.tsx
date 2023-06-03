import React, { useEffect, useState } from "react";
import TokenInput from "./components/TokenInput";
import { ethers, BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import { DOWNGRADE_TOKEN, FETCH_BALANCE } from "../shared/events";
import TOKEN_MAP from "../shared/tokens";
import CobwebPage from "./components/CobwebPage";
import ToastHandler from "./components/ToastHandler";
import InfoPopover from "./components/InfoPopover";

const DowngradingTokens = () => {
  const [balance, setBalance] = useState(constants.Zero);
  const [downgrading, setDowngrading] = useState<BigNumber>(balance);
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

  const authorizeTransaction = async () => {
    chrome.runtime.sendMessage({
      message: DOWNGRADE_TOKEN,
      options: { downgrading },
    });
  };

  const [currency] = useState(TOKEN_MAP.ETH.name);

  return (
    <>
      <CobwebPage>
        <>
          <h2 className="mb-0">Downgrading Tokens</h2>
          <hr className="my-1" />
          <div className="d-flex flex-column align-items-center gap-1">
            <p style={{ fontSize: 16 }}>
              Downgrading tokens converts wrapped tokens (ETHx) into typical
              blockchain tokens (ETH), which have the same value.
            </p>
            <p className="d-inline">
              from <span className="blue">{currency}</span> to
              <span className="blue"> {currency.slice(0, -1)}</span>
              <InfoPopover
                text="This will increase your ETH balance, and decrease your ETHx balance. ETH tokens can be converted back to ETHx via the 'Upgrade more tokens' page."
                moreSquare
              />
            </p>
            <TokenInput
              value={downgrading}
              setValue={setDowngrading}
              label="Amount of ETHx to downgrade"
            />
            <p className="mb-0 text-muted" style={{ fontSize: 14 }}>
              ({ethers.utils.formatEther(balance)} {TOKEN_MAP.ETH.name}{" "}
              available, total remaining would be{" "}
              {ethers.utils.formatEther(balance.sub(downgrading))}{" "}
              {TOKEN_MAP.ETH.name} in wrapped tokens)
            </p>
            {balance.eq(downgrading) ? (
              <p className="blue mb-0" style={{ fontSize: 14 }}>
                Warning: Cobweb will not be able to create streams if no wrapped
                tokens exist.{" "}
              </p>
            ) : null}
            {downgrading.gt(balance) ? (
              <p className="blue mb-0" style={{ fontSize: 14 }}>
                You can't downgrade more tokens than you own.
              </p>
            ) : null}
            <button
              type="button"
              className="btn glassy-cw-btn p-1 px-2"
              onClick={authorizeTransaction}
              disabled={
                downgrading.gt(balance) || downgrading.eq(constants.Zero)
              }
              aria-label="Authorize token downgrade transaction"
            >
              Authorize
            </button>
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default DowngradingTokens;
