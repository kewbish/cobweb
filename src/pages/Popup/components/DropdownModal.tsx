import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

const DropdownModal = ({
  id,
  title,
  children,
  force = false,
  actions,
}: {
  id: string;
  title: string;
  children: JSX.Element;
  force?: boolean;
  actions?: JSX.Element;
}) => (
  <div
    id={id}
    className="modal fade"
    aria-labelledby="cobwebModalLabel"
    aria-hidden="true"
    data-bs-backdrop={force ? "static" : undefined}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div
        className="modal-content"
        style={{ borderRadius: "32px", backdropFilter: "blur(15px)" }}
      >
        <div className="modal-body">
          <div className="d-flex flex-row justify-content-between align-items-top">
            <h2 className="modal-title" id="cobwebModalLabel">
              {title}
            </h2>
            <button
              type="button"
              className="btn py-0 pe-0"
              data-bs-dismiss="modal"
              aria-label="Close"
              style={{ marginTop: -5 }}
            >
              <i style={{ fontSize: 30 }} className="bi bi-x"></i>
            </button>
          </div>
          {children}
        </div>
        {actions ? (
          <div className="modal-footer">
            <button
              type="button"
              className="btn glassy-cw-btn p-1"
              data-bs-dismiss="modal"
            >
              Close
            </button>
            <button type="button" className="btn glassy-cw-btn p-1">
              Save changes
            </button>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

export default DropdownModal;
