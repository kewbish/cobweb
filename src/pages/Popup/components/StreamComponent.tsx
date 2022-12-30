import React, { useEffect } from "react";
import { GraphQlStream } from "../../shared/types";
import { ethers } from "ethers";
import { formatDistance } from "date-fns";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

const StreamComponent = ({
  stream,
  isIn,
}: {
  stream: GraphQlStream;
  isIn: boolean;
}) => {
  useEffect(() => {
    const until = new bootstrap.Popover(
      document.getElementById(`streamed-until-${stream.id}`)
    );
    return () => {
      until.dispose();
    };
  }, []);

  return (
    <div
      className="glassy-cw-btn mb-1"
      style={{ cursor: "auto", borderRadius: "16px", padding: 12 }}
    >
      <p
        className="display mb-0"
        style={{ fontSize: 20 }}
        id={"streamed-until-" + stream.id}
        data-bs-toggle="popover"
        data-bs-trigger="hover focus"
        data-bs-placement="bottom"
        data-bs-content={
          ethers.utils.formatUnits(stream.streamedUntilUpdatedAt) + " ETHx"
        }
        data-bs-template={
          '<div class="popover" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
        }
      >
        {" "}
        {(+ethers.utils.formatUnits(stream.streamedUntilUpdatedAt)).toFixed(
          4
        )}{" "}
        {stream.token.name}
      </p>
      <p
        style={{ marginTop: -(400 / stream.token.decimals - 30), fontSize: 14 }}
      >
        {" "}
        {!isIn ? "from" : "to"}{" "}
        <span className="blue">{stream.addressInOut}</span>,{" "}
        {stream.userData ? "on " : null}
        {stream.userData ? (
          <a
            href={stream.userData.split(" ")[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="cobweb-link"
          >
            <span>{stream.userData.split(" ")[0]}</span>
          </a>
        ) : null}{" "}
        {stream.updatedAtTimestamp
          ? formatDistance(stream.updatedAtTimestamp, new Date(), {
              addSuffix: true,
            })
          : null}
      </p>
    </div>
  );
};

export default StreamComponent;
