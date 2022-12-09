export interface Env {
  COBWEB_KV: KVNamespace;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return new Response("Hello World!");
  },
};

export default worker;
