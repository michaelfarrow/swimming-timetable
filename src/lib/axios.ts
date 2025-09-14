import axios from "axios";

import {
  type HttpsProxyAgentOptions,
  HttpsProxyAgent,
} from "https-proxy-agent";

const extraOpts = Symbol("extra agent opts");

export class PatchedHttpsProxyAgent<T> extends HttpsProxyAgent<T> {
  private ca: any;

  constructor(url: URL, opts: HttpsProxyAgentOptions<T>) {
    super(url, opts);
    (this as any)[extraOpts] = opts;
  }

  async connect(req: any, opts: any): Promise<any> {
    return super.connect(
      req,
      Object.assign(req, { ...(this as any)[extraOpts], ...opts }),
    );
  }
}

const httpsAgent = new PatchedHttpsProxyAgent(
  `https://${import.meta.env.PROXY_USER}:${import.meta.env.PROXY_PASSWORD}@proxy.home.farrow.io:10080`,
  {
    rejectUnauthorized: false,
    timeout: 20000,
    sessionTimeout: 20000,
    keepAlive: true,
  },
);

export const client = axios.create({
  httpsAgent:
    import.meta.env.PROXY_USER && import.meta.env.PROXY_PASSWORD
      ? httpsAgent
      : undefined,
  timeout: 20000,
});
