export interface Env {
  COBWEB_KV: KVNamespace;
  ADMIN_KEY: string;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    if (request.headers.get("Authorization")?.endsWith(` ${env.ADMIN_KEY}`)) {
      const params = new URLSearchParams(request.url);
      const identifier = params.get("identifier");
      const address = params.get("address");
      if (identifier && address) {
        await env.COBWEB_KV.put(identifier, address);
        const total = await env.COBWEB_KV.get("total");
        if (total) {
          await env.COBWEB_KV.put("total", String(parseInt(total) - 1));
        }
        return new Response(`Associated ${identifier} to ${address}.`);
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
