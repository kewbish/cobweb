import { Signer } from "ethers";
import { storage } from "@extend-chrome/storage";

const generateSignature = async (mmSigner: Signer): Promise<String> => {
  const { address } = await storage.local.get("address");
  // TODO - verify signature before proceeding
  const { signature } = await storage.local.get("signature");
  if (signature) {
    return signature;
  }
  const signed = await mmSigner.signMessage(address);
  storage.local.set({ signature: address + "&" + signed });
  return signed;
};

export default generateSignature;
