import { storage } from "@extend-chrome/storage";

const setNewToast = (message: string) => {
  storage.local.set(({ toasts }: { toasts: Array<string> }) => {
    return {
      toasts: toasts && toasts.length ? toasts.concat(message) : [message],
    };
  });
};

export const deleteToast = (message: string) => {
  storage.local.set(({ toasts }: { toasts: Array<string> }) => {
    return {
      toasts:
        toasts && toasts.length
          ? toasts.filter((toast) => toast !== message)
          : [],
    };
  });
};

export default setNewToast;
