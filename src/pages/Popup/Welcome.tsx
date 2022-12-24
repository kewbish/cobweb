import React, { useEffect, useState } from "react";
import { ethers, BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import BackgroundBox from "./components/BackgroundBox";
import ProfilePic from "./components/ProfilePic";
import FadedPill from "./components/FadedPill";
import { createSearchParams, useNavigate } from "react-router-dom";
import { USER_SET_WALLET } from "../shared/events";
import { toast } from "../shared/toast";
import { Wallet } from "../shared/types";

const Welcome = () => {
  const [address, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [balance, setBalance] = useState(constants.Zero);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );
  const [, setCwInitialized, ,]: [
    boolean | null,
    (value: boolean) => void,
    any,
    any
  ] = useChromeStorageLocal(
    "extend-chrome/storage__local--cwInitialized",
    null
  );

  const [, setWallet, ,]: [any, (value: Wallet) => void, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--wallet");

  useEffect(() => {
    if (!balanceRes) {
      return;
    }
    setBalance(BigNumber.from(balanceRes));
  }, [balanceRes]);

  const navigate = useNavigate();

  const generateNewWallet = async () => {
    try {
      const wallet = ethers.Wallet.createRandom();
      setWallet({
        address: wallet.address,
        mnemonic: wallet.mnemonic.phrase,
        pkey: wallet.privateKey,
      });
    } catch {
      toast("Couldn't generate wallet.");
    }
  };

  const initializeCobWeb = async () => {
    setCwInitialized(true);
    await generateNewWallet();
    navigate({
      pathname: "/",
      search: createSearchParams({ onboarding: "true" }).toString(),
    });
  };

  return (
    <div className="App mx-2 my-3 p-0">
      <div className="container">
        <BackgroundBox>
          <>
            <h1 className="display" style={{ fontSize: 70 }}>
              Cobweb
            </h1>
            <p>
              An Ethereum-based Web Monetization tool, enabling creation like
              never before.
            </p>
            <p style={{ fontSize: 16 }} className="text-muted mb-1">
              Switch accounts in Metamask, or proceed:
            </p>
            <div className="d-flex justify-content-center">
              <div
                style={{ cursor: "pointer", width: "fit-content" }}
                onClick={initializeCobWeb}
              >
                <FadedPill>
                  <div className="d-flex justify-content-end align-items-center h-auto p-1 m-0">
                    <div
                      className="d-flex align-items-center"
                      style={{ marginRight: "5px" }}
                    >
                      <p className="align-self-center m-0">
                        {ethers.utils.formatUnits(
                          balance.sub(balance.mod(1e12))
                        )}{" "}
                        ETH
                      </p>
                    </div>
                    <ProfilePic width={40} address={address} noNav={true} />
                  </div>
                </FadedPill>
              </div>
            </div>
          </>
        </BackgroundBox>
        <div className="d-flex flex-row justify-content-between align-items-end">
          <p className="mt-2 mb-0">
            <a
              href="https://github.com/kewbish/cobweb"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              view source
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/kewbish/cobweb/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              get help
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
