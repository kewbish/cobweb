import React, { useEffect, useState } from "react";
import CobwebPage from "./components/CobwebPage";
import { FETCH_SIGNATURE } from "../shared/events";
import { useChromeStorageLocal } from "use-chrome-storage";

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
  });

  return (
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
          />
          <div className="input-group-append">
            <button
              className="btn p-1 glassy-cw-btn"
              type="button"
              style={{
                borderRadius: "0 0.5rem 0.5rem 0",
              }}
              onClick={() => navigator.clipboard.writeText(signature)}
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
  );
};

export default CobwebInfo;
