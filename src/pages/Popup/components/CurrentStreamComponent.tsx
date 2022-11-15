import React, { useEffect } from "react";
import { Stream } from "../../shared/types";
import streamedUntilNow from "../lib/streamedUntilNow";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import { ethers } from "ethers";

const StreamComponent = ({ stream }: { stream: Stream }) => {
  useEffect(() => {
    new bootstrap.Popover(document.getElementById("streamed-until"));
  }, []);

  return (
    <div className="form-control" style={{ cursor: "auto" }}>
      <p
        className="display mb-0"
        style={{ fontSize: 400 / 18 }}
        id="streamed-until"
        data-bs-toggle="popover"
        data-bs-trigger="hover focus"
        data-bs-placement="bottom"
        data-bs-content={ethers.utils.formatUnits(streamedUntilNow(stream))}
        data-bs-template={
          '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
        }
      >
        {(+ethers.utils.formatUnits(streamedUntilNow(stream))).toFixed(4)}
        ETH
      </p>
      <p
        style={{
          marginTop: -(400 / (stream.token?.decimals ?? 18) - 30),
          fontSize: 14,
        }}
      >
        streamed so far to <span className="blue">{stream.recipient}</span>, on{" "}
        {stream.url}
      </p>
    </div>
  );
};

export default StreamComponent;
