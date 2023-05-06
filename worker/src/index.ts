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

    const returnUserInformation = async (): Promise<Response> => {
      const params = new URLSearchParams(new URL(request.url).search);
      const address = params.get("address");
      if (address) {
        const valid = (await env.COBWEB_KV.get(address.toLowerCase())) !== null;
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

    const reportUser = async (): Promise<Response> => {
      const params = new URLSearchParams(new URL(request.url).search);
      const address = params.get("address");
      const url = params.get("url");
      if (address) {
        if (env.ENVIRONMENT === "dev") {
          logger(
            "Report received for: " + address + (url ? " with URL " + url : ""),
            "REPT"
          );
        }
        await fetch(env.WEBHOOK_URL, {
          method: "POST",
          body: JSON.stringify({
            content: null,
            embeds: [
              {
                title: "New Cobweb User Report",
                description:
                  `Tag: \`${address}\`` + (url ? `\nURL: ${url}` : ""),
                color: 14367074,
              },
            ],
            attachments: [],
          }),
          headers: { "Content-Type": "application/json" },
        });
        return new Response(JSON.stringify({ success: true }), HEADERS);
      } else {
        return new Response(JSON.stringify({ error: "No tag provided." }), {
          ...HEADERS,
          status: 400,
        });
      }
    };

    const requestNewUser = async (): Promise<Response> => {
      const params = new URLSearchParams(new URL(request.url).search);
      const address = params.get("address");
      if (address) {
        const valid = await env.COBWEB_KV.get(address);
        if (!valid) {
          await fetch(env.WEBHOOK_URL, {
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
            headers: { "Content-Type": "application/json" },
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

    try {
      const url = new URL(request.url);
      if (url.pathname === "/request") {
        return requestNewUser();
      } else if (url.pathname === "/report") {
        return reportUser();
      } else {
        return returnUserInformation();
      }
    } catch {
      return new Response(JSON.stringify({ error: "Unknown error" }), {
        ...HEADERS,
        status: 500,
      });
    }
  },
};

export default worker;
