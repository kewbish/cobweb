import { ethers } from "ethers";

export interface Env {
  COBWEB_KV: KVNamespace;
  ADMIN_KEY: string;
  INFURA_API_KEY: string;
  INFURA_ID: string;
  MASTER_WALLET_PKEY: string;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const auth = request.headers.get("Authorization") ?? "";
    if (
      atob(auth.substring(auth.lastIndexOf(" ") + 1)).endsWith(
        `:${env.ADMIN_KEY}`
      )
    ) {
      const provider = new ethers.providers.InfuraProvider("goerli", {
        projectSecret: env.INFURA_API_KEY,
        projectId: env.INFURA_ID,
      });
      console.log(
        "Connected to Infura on chain " +
          (await provider.getNetwork()).chainId +
          "."
      );

      const params = new URLSearchParams(request.url);
      const identifier = params.get("identifier");
      const address = params.get("address");
      if (identifier && address && ethers.utils.isAddress(address)) {
        await env.COBWEB_KV.put(identifier, address);
        const total = await env.COBWEB_KV.get("total");
        if (!total) {
          await env.COBWEB_KV.put("total", String(100));
        }
        if (total) {
          await env.COBWEB_KV.put("total", String(parseInt(total) - 1));
        }
        const wallet = new ethers.Wallet(env.MASTER_WALLET_PKEY);
        const signer = wallet.connect(provider);
        const tx = {
          from: wallet.address,
          to: address,
          value: ethers.utils.parseUnits((0.2 / 500).toString(), "ether"), // TODO
          nonce: provider.getTransactionCount(wallet.address, "latest"),
          gasLimit: 0x100000,
          gasPrice: provider.getGasPrice(),
        };
        signer.sendTransaction(tx).then((transaction) => {
          console.dir(transaction);
        });
        return new Response(
          `Associated ${identifier} to ${address} and transferred starter ETH.`
        );
      }
      return new Response(
        "Error: could not get `identifier` and `address` params."
      );
    } else {
      return new Response("Error: unauthorized.");
    }
  },
};

export default worker;
