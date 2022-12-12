import { ethers, BigNumber, constants } from "ethers";
import React, { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  DELETE_STREAM,
  BLOCK_SITE,
  UPDATE_SETTING,
  UPDATE_STREAM,
  FETCH_BALANCE,
} from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { PayRates, Stream } from "../shared/types";
import Setting from "./components/Setting";
import DropdownModal from "./components/DropdownModal";
import BackgroundBox from "./components/BackgroundBox";
import ProfilePic from "./components/ProfilePic";
import FadedPill from "./components/FadedPill";
import streamedUntilNow from "./lib/streamedUntilNow";
import { getRate } from "../Background/lib/getRate";
import Onboarding from "./components/OnboardingCarousel";

import "bootstrap-icons/font/bootstrap-icons.css";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import TOKEN_MAP from "../shared/tokens";
import { toast } from "../shared/toast";

const Popup = () => {
  const [address, , addressSet]: [string, any, boolean, any] =
    useChromeStorageLocal("extend-chrome/storage__local--address", "");
  const [balance, setBalance] = useState(constants.Zero);
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );
  const [, , cwInitializedSet]: [any, any, boolean, any] =
    useChromeStorageLocal("extend-chrome/storage__local--cwInitialized", null);

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
    const popover = document.getElementById("balance-popover");
    if (popover) {
      popover.title =
        ethers.utils.formatUnits(balanceRes) + " " + TOKEN_MAP.ETH.name;
      new bootstrap.Popover(popover);
    }
  }, [balanceRes]);

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const welcomeModal = new bootstrap.Modal(
      document.getElementById("welcome")
    );
    if (searchParams.get("onboarding") === "true") {
      welcomeModal.show();
    }
  }, [searchParams]);

  const [currentStreams, , ,]: [Array<Stream>, any, any, any] =
    useChromeStorageLocal("streams", []);

  const [tabId, setTabId] = useState(0);
  const [url, setUrl] = useState("");
  const [rate, setRate] = useState({
    rateAmount: constants.Zero,
    payWhen: PayRates.ANY,
  });

  useEffect(() => {
    try {
      chrome.tabs.query({ active: true }, async (tabs: chrome.tabs.Tab[]) => {
        if (!tabs) {
          return;
        }
        setTabId(tabs[0].id ?? 0);
        setUrl(tabs[0].url ?? tabs[0].pendingUrl ?? "");
        setRate(
          (await getRate(url)) ?? {
            rateAmount: constants.Zero,
            payWhen: PayRates.ANY,
          }
        );
      });
    } catch (e) {
      toast("Couldn't get current tab rate");
    }
  }, [url]);

  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  useEffect(() => {
    setCurrentStream(
      currentStreams.filter((stream: Stream) => stream.tabId === tabId)[0]
    );
  }, [tabId, currentStreams]);

  const editStream = async ({
    oldKey,
    newKey,
    rateAmt,
  }: {
    oldKey: string;
    newKey: string;
    rateAmt: BigNumber;
  }) => {
    if (!currentStream) {
      toast("Couldn't find stream");
      // throw new Error("Expected stream");
      return;
    }
    try {
      chrome.runtime.sendMessage({
        message: UPDATE_SETTING,
        options: {
          oldKey,
          newKey,
          rateAmt,
        },
      });
      chrome.runtime.sendMessage({
        message: UPDATE_STREAM,
        options: {
          rateAmount: rateAmt,
          to: currentStream.recipient,
          tabId,
          url,
        },
      });
    } catch {
      toast("Could not update settings");
    }
  };

  const cancelStream = async (stream: Stream) => {
    try {
      chrome.runtime.sendMessage({
        message: DELETE_STREAM,
        options: {
          tabId: stream.tabId,
        },
      });
    } catch {
      toast("Couldn't cancel stream");
    }
  };

  const blockStream = async (stream: Stream) => {
    try {
      await cancelStream(stream);
      const hostname = new URL(url).hostname;
      chrome.runtime.sendMessage({
        message: BLOCK_SITE,
        options: {
          site: hostname,
        },
      });
    } catch {
      toast("Couldn't block site");
    }
  };

  useEffect(() => {
    var popoverTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    var popoverList = popoverTriggerList.map(function (
      popoverTriggerEl: HTMLElement
    ) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
    for (const popover of popoverList) {
      popover.enable();
    }
    return () => {
      for (const popover of popoverList) {
        popover.dispose();
      }
    };
  }, [balance]);

  return (
    <div className="App mx-2 my-3 p-0">
      {!addressSet || !cwInitializedSet ? <Navigate to="/welcome" /> : null}
      <div className="container">
        <div className="d-flex justify-content-between align-items-start">
          <h1 className="display" style={{ fontSize: 40, fontWeight: 200 }}>
            Cobweb
          </h1>
          <div
            style={{ marginTop: "-10px" }}
            data-bs-toggle="popover"
            title={
              ethers.utils.formatUnits(balance, "ether") +
              " " +
              TOKEN_MAP.ETH.name
            }
            data-bs-trigger="hover focus"
            data-bs-template={
              '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
            }
            id="balance-popover"
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
                <ProfilePic width={40} address={address} />
              </div>
            </FadedPill>
          </div>
        </div>
        <BackgroundBox>
          <div>
            {currentStream ? (
              <>
                <h2 style={{ fontWeight: 400, marginBottom: 0 }}>
                  Web Monetization Enabled
                </h2>
                <hr className="my-1" />
                <p
                  className="display"
                  style={{
                    fontWeight: 200,
                    marginBottom: 0,
                  }}
                  id="streamed-until"
                  data-bs-toggle="popover"
                  data-bs-trigger="hover focus"
                  data-bs-placement="bottom"
                  data-bs-content={ethers.utils.formatUnits(
                    streamedUntilNow(currentStream)
                  )}
                >
                  {(+streamedUntilNow(currentStream)).toFixed(4)} ETH
                </p>
                <p>
                  streamed so far to{" "}
                  <span className="blue">{currentStream.url}</span>
                </p>
                <div className="d-flex justify-content-evenly gap-2">
                  <button
                    type="button"
                    className="btn p-1 glassy-cw-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#editingStream"
                  >
                    Edit stream
                  </button>
                  <button
                    type="button"
                    className="btn p-1 glassy-cw-btn"
                    onClick={() => cancelStream(currentStream)}
                  >
                    Cancel stream
                  </button>
                  <button
                    type="button"
                    className="btn p-1 glassy-cw-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#blockPage"
                  >
                    Block this page
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontWeight: 400, marginBottom: 0 }}>
                  Web Monetization Disabled
                </h2>
                <hr className="my-1 mb-2" />
                <div className="d-flex justify-content-evenly gap-2">
                  {rate.rateAmount === constants.Zero ? (
                    <button
                      type="button"
                      className="btn p-1 glassy-cw-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#unblockSite"
                    >
                      Unblock site
                    </button>
                  ) : null}
                  <Link to="balance">
                    <button type="button" className="btn p-1 glassy-cw-btn">
                      Manage balances
                    </button>
                  </Link>
                  <Link to="streams/out">
                    <button type="button" className="btn p-1 glassy-cw-btn">
                      See past streams
                    </button>
                  </Link>
                  <Link to="settings/default">
                    <button type="button" className="btn p-1 glassy-cw-btn">
                      Edit stream settings
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
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
      <DropdownModal id="editingStream" title="Edit stream">
        <>
          <p className="blue">This will instantly take effect.</p>
          <Setting
            skey={url}
            value={rate}
            setSetting={editStream}
            onBlur={false}
          />
        </>
      </DropdownModal>
      <DropdownModal
        id="blockPage"
        title="Do you want to block this site once or forever?"
      >
        <>
          <p className="blue">You can always change this in settings.</p>
          <div className="d-flex gap-2">
            <button
              type="button"
              className={
                "btn glassy-cw-btn p-1" + currentStream == null
                  ? " disabled"
                  : ""
              }
              onClick={() => {
                if (currentStream) {
                  cancelStream(currentStream);
                }
              }}
              data-bs-dismiss="modal"
            >
              Once
            </button>
            <button
              type="button"
              className={
                "btn glassy-cw-btn p-1" + currentStream == null
                  ? " disabled"
                  : ""
              }
              onClick={() => {
                if (currentStream) {
                  blockStream(currentStream);
                }
              }}
              data-bs-dismiss="modal"
            >
              Forever
            </button>
          </div>
        </>
      </DropdownModal>
      <DropdownModal id="welcome" title="Welcome to CobWeb!">
        <Onboarding />
      </DropdownModal>
    </div>
  );
};

export default Popup;
