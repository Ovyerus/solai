import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://solai.style",
  output: "static",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
  },
});
