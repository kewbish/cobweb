import { providers } from "ethers";
import { storage } from "@extend-chrome/storage";
import verifySignature from "../../shared/verifySignature";

const generateSignature = async (
  mmProvider: providers.Web3Provider
): Promise<String> => {
  const { address } = await storage.local.get("address");
  const { signature } = await storage.local.get("signature");
  if (verifySignature(signature)) {
    return signature;
  }
  await mmProvider.send("eth_requestAccounts", []);
  const signed = await mmProvider.getSigner().signMessage(address);
  const finalSignature = "COBWEB:" + address + "&" + signed;
  storage.local.set({ signature: finalSignature });
  return finalSignature;
};

export default generateSignature;
