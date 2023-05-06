import "process";
import { storage } from "@extend-chrome/storage";

export const isDev = async () =>
  !process.env.NODE_ENV ||
  process.env.NODE_ENV === "development" ||
  ((await storage.local.get("testChainMode")) as { testChainMode: boolean })
    .testChainMode === true;
