import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  output: "server",
  output: "hybrid",
  adapter: vercel(),
});
