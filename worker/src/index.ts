import { ethers } from "ethers";

export interface Env {
  COBWEB_KV: KVNamespace;
  ADMIN_KEY: string;
  INFURA_API_KEY: string;
  INFURA_ID: string;
  MASTER_WALLET_PKEY: string;
  ENVIRONMENT: string;
}

const HEADERS = {
  headers: {
    "content-type": "application/json;charset=UTF-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS",
    "Access-Control-Max-Age": "86400",
  },
};

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    const logger = (message: String, scope: String = "") => {
      console.log(
        `${new Date().toJSON()} ${scope ? "- [" + scope + "]" : ""} ${message}`
      );
    };

    const addNewUser = async () => {
      const auth = request.headers.get("Authorization") ?? "";
      if (env.ENVIRONMENT === "dev") {
        logger(request.headers.get("Authorization") ?? "null", "AUTH");
      }

      if (
        atob(auth.substring(auth.lastIndexOf(" ") + 1)).endsWith(
          `:${env.ADMIN_KEY}`
        )
      ) {
        const provider = new ethers.providers.InfuraProvider("goerli", {
          projectSecret: env.INFURA_API_KEY,
          projectId: env.INFURA_ID,
        });
        if (env.ENVIRONMENT === "dev") {
          logger(
            "Connected to Infura on chain " +
              (await provider.getNetwork()).chainId +
              ".",
            "ETH"
          );
        }

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
            if (env.ENVIRONMENT === "dev") {
              logger(
                String(parseInt(total) - 1) + " giveaways remaining.",
                "ETH"
              );
            }
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
            if (env.ENVIRONMENT === "dev") {
              logger(String(transaction), "ETH");
            }
          });
          return new Response(
            JSON.stringify({
              message: `Associated ${identifier} to ${address} and transferred starter ETH.`,
            }),
            {
              ...HEADERS,
              status: 200,
            }
          );
        }
        if (env.ENVIRONMENT === "dev") {
          logger("Could not get params - " + params, "PARAMS");
        }
        return new Response(
          JSON.stringify({ error: "No address or no identifier provided" }),
          {
            ...HEADERS,
            status: 400,
          }
        );
      } else {
        if (env.ENVIRONMENT === "dev") {
          logger(
            "Unauthorized, attempted: " +
              atob(auth.substring(auth.lastIndexOf(" ") + 1)),
            "AUTH"
          );
        }
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          ...HEADERS,
          status: 401,
        });
      }
    };

    const returnUserInformation = async (): Promise<Response> => {
      const params = new URLSearchParams(request.url);
      const address = params.get("address");
      if (address) {
        const valid = await env.COBWEB_KV.get(address);
        if (env.ENVIRONMENT === "dev") {
          logger("Requested " + address + ", is " + valid, "GET");
        }
        return new Response(JSON.stringify({ valid }), HEADERS);
      } else {
        return new Response(JSON.stringify({ error: "No address provided." }), {
          ...HEADERS,
          status: 400,
        });
      }
    };

    if (env.ENVIRONMENT === "dev") {
      logger("Request URL:" + request.url, "REQ");
    }

    const url = new URL(request.url);
    if (url.pathname === "/add") {
      return addNewUser();
    } else {
      return returnUserInformation();
    }
  },
};

export default worker;
