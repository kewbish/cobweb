import { Stream } from "../../shared/types";
import { storage } from "@extend-chrome/storage";

const getStreamByTabId = async (tabId: number) => {
  storage.local.get("streams").then(({ streams }) => {
    return streams.filter((stream: Stream) => stream.tabId === tabId) ?? null;
  });
};

export default getStreamByTabId;
