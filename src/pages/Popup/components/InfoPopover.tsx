import React from "react";
import { useEffect } from "react";
// @ts-expect-error
import IconSvg from "../../../assets/img/info-icon.svg";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

const InfoPopover = ({
  text,
  moreSquare,
}: {
  text: string;
  moreSquare?: boolean;
}) => {
  useEffect(() => {
    const popover = new bootstrap.Popover(
      document.getElementById("info-popover")
    );
    return () => {
      popover.dispose();
    };
  }, []);

  return (
    <div style={{ display: "inline-block", paddingLeft: "4px" }}>
      <img
        src={IconSvg}
        alt="Information icon"
        id="info-popover"
        data-bs-toggle="popover"
        data-bs-trigger="hover focus"
        data-bs-placement="bottom"
        data-bs-content={text}
        data-bs-interval="false"
        data-bs-template={
          '<div class="popover ' +
          (moreSquare ? "popover-squarer" : "") +
          '" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
        }
      />
    </div>
  );
};

export default InfoPopover;
