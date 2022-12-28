import { ethers } from "ethers";
import { Framework } from "@superfluid-finance/sdk-core";

export interface Env {
  COBWEB_KV: KVNamespace;
  ADMIN_KEY: string;
  INFURA_API_KEY: string;
  INFURA_ID: string;
  MASTER_WALLET_PKEY: string;
  ENVIRONMENT: string;
  WEBHOOK_URL: string;
  SF_TOKEN_ADDRESS: string;
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
        const provider = new ethers.providers.InfuraProvider(
          env.ENVIRONMENT === "dev" ? "goerli" : "homestead",
          {
            projectSecret: env.INFURA_API_KEY,
            projectId: env.INFURA_ID,
          }
        );
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
          const sf = await Framework.create({
            chainId: env.ENVIRONMENT === "dev" ? 5 : 1,
            provider,
          });
          const sfToken = await sf.loadSuperToken(env.SF_TOKEN_ADDRESS);
          const wallet = new ethers.Wallet(env.MASTER_WALLET_PKEY);
          const signer = wallet.connect(provider);
          const transferOperation = sfToken.transfer({
            receiver: address,
            amount: ethers.utils.formatEther(0.2 / 500),
          });
          try {
            transferOperation
              .exec(signer)
              .then((transaction) => transaction.wait())
              .then((transaction) => {
                if (env.ENVIRONMENT === "dev") {
                  logger(String(transaction), "ETH");
                }
                return new Response(
                  JSON.stringify({
                    message: `Associated ${identifier} to ${address} and transferred starter ETH.`,
                  }),
                  {
                    ...HEADERS,
                    status: 200,
                  }
                );
              })
              .catch((err) => {
                if (env.ENVIRONMENT === "dev") {
                  logger("Error - " + err, "ERROR");
                }
                return new Response(
                  JSON.stringify({ error: "Could not transfer" }),
                  {
                    ...HEADERS,
                    status: 500,
                  }
                );
              });
          } catch (err) {
            if (env.ENVIRONMENT === "dev") {
              logger("Error - " + err, "ERROR");
            }
            return new Response(
              JSON.stringify({ error: "Could not transfer" }),
              {
                ...HEADERS,
                status: 500,
              }
            );
          }
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

    const requestNewUser = async (): Promise<Response> => {
      const params = new URLSearchParams(request.url);
      const address = params.get("address");
      if (address) {
        const valid = await env.COBWEB_KV.get(address);
        if (!valid) {
          fetch(env.WEBHOOK_URL, {
            method: "POST",
            body: JSON.stringify({
              content: null,
              embeds: [
                {
                  title: "New Cobweb User Request",
                  description: `Address: \`${address}\``,
                  color: 9228287,
                },
              ],
              attachments: [],
            }),
          });
          if (env.ENVIRONMENT === "dev") {
            logger("Sent request for " + address + ".", "VERIF");
          }
          return new Response(JSON.stringify({ success: true }), HEADERS);
        } else {
          return new Response(JSON.stringify({ success: false }), {
            ...HEADERS,
            status: 403,
          });
        }
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
    } else if (url.pathname === "/request") {
      return requestNewUser();
    } else {
      return returnUserInformation();
    }
  },
};

export default worker;
