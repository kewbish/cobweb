import { storage } from "@extend-chrome/storage";
import { BaseProvider } from "@ethersproject/providers";
import { BigNumber } from "ethers";

const setNewAddress = async ({
  address,
  provider,
}: {
  address: string;
  provider: BaseProvider;
}) => {
  storage.local.set({ address });
  try {
    const balance = await provider.getBalance(address);
    storage.local.set({ balance: BigNumber.from(balance) });
  } catch (e) {}
};

export default setNewAddress;
