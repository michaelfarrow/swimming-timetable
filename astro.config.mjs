import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  output: "static",
  adapter: node({
    mode: "standalone",
  }),
});
