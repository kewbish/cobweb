import React, { useEffect } from "react";
import { Stream } from "../../shared/types";
import streamedUntilNow from "../lib/streamedUntilNow";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";
import { ethers } from "ethers";

const StreamComponent = ({ stream }: { stream: Stream }) => {
  useEffect(() => {
    const until = new bootstrap.Popover(
      document.getElementById(`streamed-until-${stream.requestId}`)
    );
    return () => {
      try {
        until.dispose();
      } catch {}
    };
  }, []);

  return (
    <div className="form-control mb-1" style={{ cursor: "auto" }}>
      <p
        className="display mb-0"
        style={{ fontSize: 20 }}
        id={"streamed-until-" + stream.requestId}
        data-bs-toggle="popover"
        data-bs-trigger="hover focus"
        data-bs-placement="bottom"
        data-bs-content={
          ethers.utils.formatUnits(streamedUntilNow(stream)) + " ETHx"
        }
        data-bs-template={
          '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
        }
        tabIndex={0}
      >
        {(+ethers.utils.formatUnits(streamedUntilNow(stream))).toFixed(4)}
        ETHx
      </p>
      <p
        style={{
          marginTop: -(400 / (stream.token?.decimals ?? 18) - 30),
          fontSize: 14,
        }}
      >
        streamed so far to <span className="blue">{stream.recipient}</span>,{" "}
        {stream.url ? "on " + stream.url : null}
      </p>
    </div>
  );
};

export default StreamComponent;
