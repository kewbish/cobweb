import { storage } from "@extend-chrome/storage";
import { Web3Provider } from "@ethersproject/providers";
import { BigNumber } from "ethers";
import errorToast from "../../shared/toast";

const setNewAddress = async ({
  address,
  provider,
}: {
  address: string;
  provider: Web3Provider;
}) => {
  storage.local.set({ address });
  try {
    const balance = await provider.getBalance(address);
    storage.local.set({ balance: BigNumber.from(balance) });
  } catch (e) {
    errorToast(e as Error);
  }
};

export default setNewAddress;
