import pRetry from "p-retry";

export function fetchWithProxy(
  input: string | URL | Request,
  init?: RequestInit,
) {
  return pRetry(
    () =>
      fetch(`http://proxy.home.farrow.io/proxy/${input}`, {
        ...init,
        headers: {
          ...(init && init?.headers),
          "X-Proxy-Token": import.meta.env.PROXY_PASSWORD,
        },
      }),
    { retries: 5 },
  );
}
