import ethers, { providers } from "ethers";
import { storage } from "@extend-chrome/storage";

const generateSignature = async (
  mmProvider: providers.Web3Provider
): Promise<String> => {
  const { address } = await storage.local.get("address");
  const { signature } = await storage.local.get("signature");
  const signatureParts = signature.split("&");
  if (
    signatureParts[0] === address &&
    ethers.utils.verifyMessage(address, signatureParts[1])
  ) {
    return signature;
  }
  await mmProvider.send("eth_requestAccounts", []);
  const signed = await mmProvider.getSigner().signMessage(address);
  const finalSignature = address + "&" + signed;
  storage.local.set({ signature: finalSignature });
  return finalSignature;
};

export default generateSignature;
