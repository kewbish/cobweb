import { ethers, BigNumber, constants } from "ethers";
import React, { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import {
  DELETE_STREAM,
  BLOCK_TAG,
  UPDATE_SETTING,
  UPDATE_STREAM,
  CHECK_METAMASK,
} from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { Rate, PayRates, Stream } from "../shared/types";
import Setting from "./components/Setting";
import DropdownModal from "./components/DropdownModal";
import BackgroundBox from "./components/BackgroundBox";
import streamedUntilNow from "./lib/streamedUntilNow";
import { getRate } from "../Background/lib/getRate";
import Onboarding from "./components/OnboardingCarousel";
import ToastHandler from "./components/ToastHandler";
import BalanceDisplay from "./components/BalanceDisplay";
import fallbackRate from "../shared/fallbackRate";
import InfoPopover from "./components/InfoPopover";

import "bootstrap-icons/font/bootstrap-icons.css";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import TOKEN_MAP from "../shared/tokens";
import { toast } from "../shared/toast";

const Popup = () => {
  const [address, , ,]: [string, any, boolean, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    null
  );
  const [cwInitialized, , ,]: [boolean, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--cwInitialized",
    null
  );
  const [metamaskNotFound, ,]: [boolean, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--mmNotFound",
    null
  );
  const [balanceRes, , ,]: [any, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--balance",
    null
  );

  useEffect(() => {
    if (address) {
      chrome.runtime.sendMessage({
        message: CHECK_METAMASK,
      });
    }
  }, [address]);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!document.getElementById("welcome")) {
      return;
    }
    const welcomeModal = new bootstrap.Modal(
      document.getElementById("welcome")
    );
    if (searchParams.get("onboarding") === "true") {
      welcomeModal.show();
    }
    document
      .getElementById("welcome")
      ?.addEventListener("hidden.bs.modal", () => {
        setSearchParams([]);
      });
    return () => {
      try {
        welcomeModal.dispose();
      } catch {}
    };
  }, [searchParams]);

  const [currentStreams, , ,]: [Array<Stream>, any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--streams", []);

  const [tabId, setTabId] = useState(0);
  const [defaultRate, , ,]: [Rate, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--defaultRate",
    fallbackRate
  );
  const [rate, setRate] = useState(defaultRate);

  const [currentStream, setCurrentStream] = useState<Stream | null>(null);

  useEffect(() => {
    try {
      chrome.tabs.query({ active: true }, async (tabs: chrome.tabs.Tab[]) => {
        if (!tabs) {
          return;
        }
        setTabId(tabs[0].id ?? 0);
        if (currentStream) {
          setRate((await getRate(currentStream?.recipient)) ?? defaultRate);
        }
      });
    } catch (e) {
      toast("Couldn't get current tab rate");
    }
  }, [currentStream]);

  useEffect(() => {
    setCurrentStream(
      currentStreams.filter((stream: Stream) => stream.tabId === tabId)[0]
    );
  }, [tabId, currentStreams]);

  useEffect(() => {
    const popover = document.getElementById("streamed-until");
    let updatedPopover: any = null;
    if (popover && currentStream) {
      popover.setAttribute(
        "data-bs-title",
        ethers.utils.formatEther(streamedUntilNow(currentStream)) +
          " " +
          TOKEN_MAP.ETH.name
      );
      updatedPopover = bootstrap.Popover.getOrCreateInstance(popover);
    }
    return () => {
      try {
        updatedPopover?.dispose();
      } catch {}
    };
  }, [currentStream]);

  useEffect(() => {
    const collapse = document.getElementById("collapse");
    let newCollapse: bootstrap.Collapse | null = null;
    if (collapse && currentStream) {
      newCollapse = new bootstrap.Collapse(collapse);
    }
    return () => {
      try {
        newCollapse?.dispose();
      } catch {}
    };
  }, [currentStream]);

  const editStream = async ({
    oldKey,
    newKey,
    rateAmt,
    payWhen,
  }: {
    oldKey: string;
    newKey: string;
    rateAmt: BigNumber;
    payWhen: PayRates;
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
          payWhen,
        },
      });
      chrome.runtime.sendMessage({
        message: UPDATE_STREAM,
        options: {
          from: address,
          rateAmount: rateAmt,
          to: currentStream.recipient,
          tabId,
        },
      });
      setRate({ rateAmount: rateAmt, payWhen });
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
      chrome.runtime.sendMessage({
        message: BLOCK_TAG,
        options: {
          address: stream.recipientTag,
        },
      });
      setCurrentStream(null);
    } catch {
      toast("Couldn't block site");
    }
  };

  return (
    <div className="App mx-2 my-3 p-0">
      {metamaskNotFound ||
      (address !== null && (!address || address === "NO_ADDRESS")) ? (
        <Navigate to="/metamask/not-found" />
      ) : null}
      {address &&
      cwInitialized != null &&
      !cwInitialized &&
      !searchParams.get("onboarding") ? (
        <Navigate to="/welcome" />
      ) : null}
      <div className="container">
        <div className="d-flex justify-content-between align-items-start">
          <h1 className="display" style={{ fontSize: 40, fontWeight: 200 }}>
            Cobweb
          </h1>
          <BalanceDisplay />
        </div>
        <BackgroundBox>
          <div>
            {currentStream ? (
              <>
                <h2 style={{ fontWeight: 400, marginBottom: 0 }}>
                  Currently Streaming
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
                  data-bs-placement="top"
                  data-bs-title={
                    ethers.utils.formatEther(streamedUntilNow(currentStream)) +
                    " " +
                    TOKEN_MAP.ETH.name
                  }
                  data-bs-template={
                    '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
                  }
                >
                  ~
                  {ethers.utils.formatUnits(
                    streamedUntilNow(currentStream).sub(
                      streamedUntilNow(currentStream).mod(1e12)
                    )
                  )}{" "}
                  ETHx
                </p>
                <p style={{ fontSize: 16 }}>
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
                <button
                  type="button"
                  className="btn p-1 glassy-cw-btn w-100 mt-2"
                  data-bs-toggle="collapse"
                  data-bs-target="#collapse"
                  aria-expanded="false"
                  aria-controls="collapse"
                >
                  More actions
                </button>
                <div id="collapse" className="collapse" data-bs-toggle="false">
                  <div className="d-flex justify-content-evenly gap-2 mt-2">
                    <Link to="balance">
                      <button className="btn p-1 glassy-cw-btn">
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
                </div>
              </>
            ) : (
              <>
                <h2 style={{ fontWeight: 400, marginBottom: 0 }}>
                  Not Streaming
                </h2>
                <p
                  className="mb-1 d-inline"
                  style={{ fontSize: 16, color: "#c6dcef" }}
                >
                  Create a stream by going to any page with a{" "}
                  <a
                    href="https://github.com/kewbish/cobweb/wiki/Cobweb-Tags-&-Account-Page"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cobweb-link"
                  >
                    Cobweb tag
                  </a>{" "}
                  on it!
                </p>
                <InfoPopover
                  text="Please click confirm on any MetaMask popups - these allow Cobweb to create streams."
                  moreSquare
                />
                {balanceRes && BigNumber.from(balanceRes).eq(constants.Zero) ? (
                  <p
                    className="mb-0 mt-1"
                    style={{ fontSize: 16, color: "#c6dcef" }}
                  >
                    You also don't have any ETHx, so you can't make any streams.
                    Click 'Manage balances' to upgrade some ETH into ETHx!
                  </p>
                ) : null}
                <hr className="my-1 mb-2" />
                <div className="d-flex justify-content-evenly gap-2">
                  <Link to="balance">
                    <button className="btn p-1 glassy-cw-btn">
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
          <div>
            <Link to="/help">
              <button
                type="button"
                className="btn glassy-cw-btn me-1"
                style={{ fontSize: 16, padding: "0.25rem 0.4rem", height: 27 }}
                title="Get help"
              >
                <i className="bi bi-question-lg"></i>
              </button>
            </Link>
            <Link to="/report">
              <button
                type="button"
                className="btn glassy-cw-btn"
                style={{ fontSize: 16, padding: "0.25rem 0.4rem", height: 27 }}
                title="Report user"
              >
                <i className="bi bi-flag-fill"></i>
              </button>
            </Link>
          </div>
        </div>
      </div>
      <DropdownModal id="editingStream" title="Edit stream">
        <>
          <p className="blue">This will instantly take effect.</p>
          <Setting
            skey={currentStream?.recipientTag ?? ""}
            value={rate}
            setSetting={editStream}
            onBlur={false}
            showTag={false}
            key={BigNumber.from(rate.rateAmount).toString()}
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
                "btn glassy-cw-btn p-1" +
                (currentStream == null ? " disabled" : "")
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
                "btn glassy-cw-btn p-1" +
                (currentStream == null ? " disabled" : "")
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
      <ToastHandler />
    </div>
  );
};

export default Popup;
