import React, { useEffect, useState } from "react";
import CobwebPage from "./components/CobwebPage";
import ToastHandler from "./components/ToastHandler";
import { FETCH_SIGNATURE } from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";
import { toast } from "../shared/toast";

const CobwebInfo = () => {
  const [signature, setSignature] = useState<string>("");
  const [signatureLocal, , ,]: [string, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--signature",
    ""
  );

  useEffect(() => {
    const getResponse = async () => {
      chrome.runtime.sendMessage({
        message: FETCH_SIGNATURE,
      });
      setSignature(signatureLocal);
    };

    getResponse();
  }, [signatureLocal]);

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
        </>
      </CobwebPage>
      <ToastHandler />
    </>
  );
};

export default CobwebInfo;
