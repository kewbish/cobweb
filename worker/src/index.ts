export interface Env {
  COBWEB_KV: KVNamespace;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
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
  },
};

export default worker;
