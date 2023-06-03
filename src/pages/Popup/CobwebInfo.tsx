import React, { useEffect, useState } from "react";
import CobwebPage from "./components/CobwebPage";
import ToastHandler from "./components/ToastHandler";
import { FETCH_SIGNATURE, RESET_TESTCHAINMODE } from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { toast } from "../shared/toast";
import "./info-accordion.css";

const CobwebInfo = () => {
  const [address, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--address",
    ""
  );
  const [signature, setSignature] = useState<string>("");
  const [signatureLocal, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--signature",
    ""
  );
  const [requested, setRequested, ,]: [any, any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--requested", null);
  const [reactRequested, setReactRequested] = useState<boolean>(false);
  const [testChainMode, setTestChainMode, ,]: [any, any, any, any] =
    useChromeStorageLocal("extend-chrome/storage__local--testChainMode", false);

  useEffect(() => {
    const getResponse = async () => {
      chrome.runtime.sendMessage({
        message: FETCH_SIGNATURE,
      });
      setSignature(signatureLocal);
    };

    getResponse();
  }, [signatureLocal]);

  useEffect(() => {
    const getResponse = async () => {
      if (testChainMode) {
        chrome.runtime.sendMessage({
          message: RESET_TESTCHAINMODE,
        });
      }
    };

    getResponse();
  }, [testChainMode]);

  const requestVerification = async () => {
    if (!address) {
      toast("Couldn't fetch Metamask account.");
      return;
    }
    try {
      const response = await fetch(
        "https://cobweb-worker.kewbish.workers.dev/request?" +
          new URLSearchParams({ address }).toString()
      );
      const responseJson = await response.json();
      if (response.ok && responseJson.success) {
        toast("Requested!");
        setRequested(true);
        setReactRequested(true);
      } else {
        toast(
          "There was an issue with requesting verification. Please try again."
        );
      }
    } catch (e) {
      toast(
        "There was an issue with requesting verification. Please try again."
      );
    }
  };

  return (
    <>
      <CobwebPage>
        <>
          <h1 className="h2 mb-0">Cobweb Info</h1>
          <hr className="my-1" />
          <div className="input-group mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Cobweb signature"
              aria-label="Cobweb signature"
              style={{
                padding: "0 1rem",
              }}
              value={signature}
              id="cobweb-signature"
              readOnly
            />
            <div className="input-group-append">
              <button
                className="btn p-1 glassy-cw-btn"
                type="button"
                style={{
                  borderRadius: "0 0.5rem 0.5rem 0",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(signature);
                  toast("Copied!");
                }}
              >
                Copy
              </button>
            </div>
            <label htmlFor="cobweb-signature" className="mt-2">
              Copy this to the contents of any content you want to monetize.
            </label>
          </div>
          <div className="mt-1">
            <div className="accordion" id="accordionExample">
              <div className="accordion-item">
                <span className="h2 accordion-header d-block" id="headingOne">
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#collapseOne"
                    aria-expanded="true"
                    aria-controls="collapseOne"
                    aria-label="Show testchain mode information"
                  >
                    Testchain Mode
                  </button>
                </span>
                <div
                  id="collapseOne"
                  className={"accordion-collapse collapse"}
                  aria-labelledby="headingOne"
                  data-bs-parent="#accordionExample"
                >
                  <div className="accordion-body">
                    <div
                      className="form-check form-switch"
                      style={{ height: "7.4rem" }}
                    >
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckDefault"
                        checked={testChainMode}
                        onChange={(e) => setTestChainMode(e.target.value)}
                      />
                      <label
                        className="form-check-label"
                        htmlFor="flexSwitchCheckDefault"
                        style={{
                          textAlign: "left",
                          float: "left",
                          display: "inline-block",
                        }}
                      >
                        Enable{" "}
                        <a href="https://en.wikipedia.org/wiki/Testnet">
                          testchain
                        </a>{" "}
                        mode. Change your MetaMask chain to the Goerli testnet
                        and restart the extension on{" "}
                        <pre style={{ display: "inline" }}>
                          chrome://extensions
                        </pre>{" "}
                        for this to take effect.
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {requested !== null && (!requested || reactRequested) ? (
            <div className="mt-1">
              <button
                className="btn p-1 glassy-cw-btn"
                type="button"
                onClick={requestVerification}
                disabled={reactRequested}
              >
                {!reactRequested ? "Request verification" : "Requested!"}
              </button>
            </div>
          ) : null}
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default CobwebInfo;
