/* TODO: upgrade native tokens too - https://docs.superfluid.finance/superfluid/developers/interactive-tutorials/using-super-tokens#upgrading-native-assets */

import React, { useEffect, useState } from "react";
import TokenInput from "./components/TokenInput";
import { ethers, BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import { FETCH_BALANCE, UPGRADE_TOKEN } from "../shared/events";
import TOKEN_MAP from "../shared/tokens";
import CobwebPage from "./components/CobwebPage";

const UpgradingTokens = () => {
  const [balance, setBalance] = useState(constants.Zero);
  const [upgrading, setUpgrading] = useState<BigNumber>(balance);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );

  const [currency] = useState(TOKEN_MAP.ETH.name);

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
      message: UPGRADE_TOKEN,
      options: { upgrading },
    });
  };

  return (
    <CobwebPage>
      <>
        <h2 className="mb-0">Upgrading Tokens</h2>
        <hr className="my-1" />
        <div className="d-flex flex-column align-items-center gap-1">
          <p className="mb-0">
            from <span className="blue">{currency.slice(0, -1)}</span> to
            <span className="blue"> {currency}</span>
          </p>
          <TokenInput value={upgrading} setValue={setUpgrading} />
          <p className="mb-0 text-muted" style={{ fontSize: 14 }}>
            ({ethers.utils.formatEther(balance)} {currency} available, total
            would be {ethers.utils.formatEther(balance.add(upgrading))}{" "}
            {currency} in wrapped tokens)
          </p>
          <button
            type="button"
            className="btn glassy-cw-btn p-1 px-2"
            onClick={authorizeTransaction}
            disabled={upgrading.lte(constants.Zero)}
          >
            Authorize
          </button>
        </div>
      </>
    </CobwebPage>
  );
};

export default UpgradingTokens;
