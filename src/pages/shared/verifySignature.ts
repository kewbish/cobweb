import { ethers } from "ethers";

const verifySignature = (signature: string) => {
  try {
    const splitSignature = signature.split("COBWEB:")[1].split("&");
    const addy = splitSignature[0];
    const signy = splitSignature[1];
    const signerAddr = ethers.utils.verifyMessage(addy, signy);
    if (signerAddr.toLowerCase() !== addy.toLowerCase()) {
      return null;
    } else {
      return signerAddr;
    }
  } catch {
    // silently fail
    return null;
  }
};

export default verifySignature;
