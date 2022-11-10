import { MONTAG_FOUND } from "../shared/events";

const handleMessaging = async (
  request: any,
  sender: chrome.runtime.MessageSender,
  sendResponse: Function
) => {
  switch (request.message) {
    case MONTAG_FOUND: {
      console.log(`COBWEB: Monetization Tag Found ${request.options.address}`);
      return;
    }
    default:
      return;
  }
};

chrome.runtime.onMessage.addListener(handleMessaging);
