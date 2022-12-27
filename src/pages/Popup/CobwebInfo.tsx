import React, { useEffect, useState } from "react";
import CobwebPage from "./components/CobwebPage";
import ToastHandler from "./components/ToastHandler";
import { APPROVE_AMT, FETCH_SIGNATURE, APPROVE_FULL } from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { Wallet } from "../shared/types";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import { toast } from "../shared/toast";
import TokenInput from "./components/TokenInput";
import { BigNumber, constants } from "ethers";

const CobwebInfo = () => {
  const [signature, setSignature] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [pkey, setPkey] = useState<string>("");
  const [show, setShow] = useState<boolean>(false);
  const [approveAmtShow, setApproveAmtShow] = useState<boolean>(false);
  const [signatureLocal, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--signature",
    ""
  );
  const [wallet, , ,]: [Wallet | null, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--wallet",
    null
  );
  const [approveAmt, setApproveAmt] = useState<BigNumber>(constants.Zero);

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
    if (wallet?.address) {
      setAddress(wallet.address);
    }
    if (wallet?.pkey) {
      setPkey(wallet?.pkey);
    }
  }, [wallet]);

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
  }, []);

  const approveAmtForSpending = () => {
    chrome.runtime.sendMessage({
      message: APPROVE_AMT,
      options: { depositAmt: approveAmt },
    });
  };

  const approveFull = () => {
    chrome.runtime.sendMessage({
      message: APPROVE_FULL,
    });
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
          <div className="d-flex flex-row">
            {address && pkey ? (
              <button
                type="button"
                className="btn glassy-cw-btn p-1 me-1"
                onClick={() => setShow((show) => !show)}
              >
                {show ? "Hide" : "Show"} Cobweb Wallet
              </button>
            ) : null}
            <button
              type="button"
              className="btn glassy-cw-btn p-1"
              onClick={() => setApproveAmtShow((show) => !show)}
            >
              Approve Cobweb Wallet Balance
            </button>
          </div>
          {address && pkey ? (
            <div
              className={
                "card cobweb-dropdown" + (show ? " mt-2 p-2 open" : "")
              }
            >
              <p style={{ fontSize: 16 }}>
                Address: {address}
                <br />
                Private key: {pkey}
              </p>
            </div>
          ) : null}
          <div
            className={
              "card cobweb-dropdown" + (approveAmtShow ? " mt-2 p-2 open" : "")
            }
          >
            <p style={{ fontSize: 16 }} className="mb-0">
              Enter an amount of wrapped tokens to approve:
            </p>
            <TokenInput value={approveAmt} setValue={setApproveAmt} />
            <div className="d-flex flex-row">
              <button
                className="btn glassy-cw-btn p-1 mt-2 me-1"
                type="button"
                onClick={approveAmtForSpending}
              >
                Approve
              </button>
              <button
                className="btn glassy-cw-btn p-1 mt-2"
                type="button"
                onClick={approveFull}
              >
                Approve all future streams
              </button>
            </div>
          </div>
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default CobwebInfo;
