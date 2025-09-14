import axios from "axios";
import { HttpsProxyAgent } from "hpagent";

const httpsAgent = new HttpsProxyAgent({
  proxy: `http://${import.meta.env.PROXY_USER}:${import.meta.env.PROXY_PASSWORD}@proxy.home.farrow.io:10080`,
  rejectUnauthorized: false,
  timeout: 20000,
  proxyRequestOptions: {
    rejectUnauthorized: false,
  },
});

export const client = axios.create({
  httpsAgent:
    import.meta.env.PROXY_USER && import.meta.env.PROXY_PASSWORD
      ? httpsAgent
      : undefined,
  timeout: 20000,
});
