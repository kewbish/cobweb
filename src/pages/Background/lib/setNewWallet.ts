import { Wallet } from "../../shared/types";
import { storage } from "@extend-chrome/storage";

const setNewWallet = (wallet: Wallet) => {
  storage.local.set({ wallet });
};

export default setNewWallet;
