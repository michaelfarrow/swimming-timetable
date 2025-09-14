import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  output: "server",
  output: "hybrid",
  adapter: vercel({
    edgeMiddleware: true,
  }),
});
