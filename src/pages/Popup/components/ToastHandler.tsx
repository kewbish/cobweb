import React, { useEffect } from "react";
import { useChromeStorageLocal } from "use-chrome-storage";
// @ts-expect-error
import bootstrap from "bootstrap/dist/js/bootstrap.bundle";

const ToastHandler = () => {
  const [toasts, , ,]: [Array<string>, any, any, any] = useChromeStorageLocal(
    "extend-chrome/storage__local--toasts",
    []
  );

  useEffect(() => {
    var toastElList = [].slice.call(document.querySelectorAll(".toast"));
    var toastList = toastElList.map(function (toastEl: HTMLElement) {
      return new bootstrap.Toast(toastEl);
    });
    toastList.forEach((toast: bootstrap.Toast) => toast.show());
    return () => {
      toastList.forEach((toast: bootstrap.Toast) => toast.dispose());
    };
  });

  return (
    <div
      className="position-absolute end-0 bottom-0 pb-2 pe-2"
      style={{ zIndex: 1090 }}
    >
      <div className="toast-container d-flex flex-column align-items-end">
        {toasts.map((toast) => (
          <div
            className="toast"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            style={{ width: "fit-content" }}
            key={toast}
          >
            <div className="toast-body">{toast}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ToastHandler;
