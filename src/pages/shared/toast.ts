import { NEW_TOAST } from "./events";

const errorToast = (e: Error) => {
  chrome.runtime.sendMessage({
    message: NEW_TOAST,
    options: {
      message: `Error: ${e.message}`,
    },
  });
};

export const toast = (s: string) => {
  chrome.runtime.sendMessage({
    message: NEW_TOAST,
    options: {
      message: s,
    },
  });
};

export default errorToast;
