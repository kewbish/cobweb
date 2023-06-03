import React from "react";
import { useEffect } from "react";
// @ts-expect-error
import IconSvg from "../../../assets/img/info-icon.svg";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

const InfoPopover = ({
  text,
  moreSquare = true,
  darker,
  id = "info-popover",
}: {
  text: string;
  moreSquare?: boolean;
  darker?: boolean;
  id?: string;
}) => {
  useEffect(() => {
    const popover = new bootstrap.Popover(document.getElementById(id));
    return () => {
      try {
        popover.dispose();
      } catch {}
    };
  }, []);

  return (
    <div style={{ display: "inline-block", paddingLeft: "4px" }} role="tooltip">
      <img
        src={IconSvg}
        alt="Information icon"
        id={id}
        data-bs-toggle="popover"
        data-bs-trigger="hover focus"
        data-bs-placement="bottom"
        data-bs-content={text}
        data-bs-interval="false"
        data-bs-template={
          '<div class="popover ' +
          (moreSquare ? "popover-squarer " : "") +
          (darker ? "popover-darker" : "") +
          '" role="tooltip"><div class="popover-arrow popover-arrow-override"></div><p class="popover-header"></p><div class="popover-body"></div></div>'
        }
        tabIndex={0}
      />
    </div>
  );
};

export default InfoPopover;
