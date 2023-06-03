import React, { useEffect, useState } from "react";
import { ethers, BigNumber, constants } from "ethers";
import { useChromeStorageLocal } from "use-chrome-storage";
import BackgroundBox from "./components/BackgroundBox";
import ProfilePic from "./components/ProfilePic";
import FadedPill from "./components/FadedPill";
import { createSearchParams, useNavigate } from "react-router-dom";
import { FETCH_BALANCE } from "../shared/events";

const Welcome = () => {
  const [address, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [balance, setBalance] = useState(constants.Zero);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    // use Metamask balance on welcome page
    "extend-chrome/storage__local--mmBalance",
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
  const [, setMMNotFound, ,]: [
    boolean | null,
    (value: boolean) => void,
    any,
    any
  ] = useChromeStorageLocal("extend-chrome/storage__local--mmNotFound", null);

  useEffect(() => {
    if (!balanceRes) {
      return;
    }
    setBalance(BigNumber.from(balanceRes));
  }, [balanceRes]);

  const navigate = useNavigate();

  const initializeCobWeb = async () => {
    setCwInitialized(true);
    setMMNotFound(false);
    navigate({
      pathname: "/",
      search: createSearchParams({ onboarding: "true" }).toString(),
    });
  };

  useEffect(() => {
    chrome.runtime.sendMessage({
      message: FETCH_BALANCE,
    });
  }, []);

  return (
    <div className="App mx-2 my-3 p-0">
      <div className="container">
        <BackgroundBox>
          <>
            <h1 className="display" style={{ fontSize: 70 }}>
              Cobweb
            </h1>
            <p>
              A Web3-based tool empowering teens to learn and earn on the
              blockchain.
            </p>
            <p style={{ fontSize: 16 }} className="text-muted mb-1">
              Switch connected accounts in Metamask, or proceed:
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
                        )}
                        {" ETH"}
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
              <span className="screen-reader-text"> opens a new window</span>
            </a>{" "}
            |{" "}
            <a
              href="https://github.com/kewbish/cobweb/discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="cobweb-link"
            >
              get help
              <span className="screen-reader-text"> opens a new window</span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
