import axios from "axios";
import { HttpsProxyAgent } from "hpagent";

const httpsAgent = new HttpsProxyAgent({
  proxy: `https://${import.meta.env.PROXY_USER}:${import.meta.env.PROXY_PASSWORD}@proxy.home.farrow.io:8080`,
  rejectUnauthorized: false,
  proxyRequestOptions: {
    rejectUnauthorized: false,
  },
});

export const client = axios.create({
  httpsAgent:
    import.meta.env.PROXY_USER && import.meta.env.PROXY_PASSWORD
      ? httpsAgent
      : undefined,
});
