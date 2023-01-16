import React, { useEffect, useState } from "react";
import CobwebPage from "./components/CobwebPage";
import ToastHandler from "./components/ToastHandler";
import { FETCH_SIGNATURE } from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { toast } from "../shared/toast";

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

  useEffect(() => {
    const getResponse = async () => {
      chrome.runtime.sendMessage({
        message: FETCH_SIGNATURE,
      });
      setSignature(signatureLocal);
    };

    getResponse();
  }, [signatureLocal]);

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
          <h2 className="mb-0">Cobweb Info</h2>
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
          {requested !== null && (!requested || reactRequested) ? (
            <div className="mt-1">
              <button
                className="btn p-1 glassy-cw-btn"
                type="button"
                onClick={requestVerification}
                disabled={reactRequested}
              >
                {!reactRequested ? "Request verification + ETH" : "Requested!"}
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
