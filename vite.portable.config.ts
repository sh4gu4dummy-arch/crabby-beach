import path from "node:path";
import { defineConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  publicDir: false,
  plugins: [tailwindcss(), viteReact()],
  resolve: {
    alias: { "@": path.resolve("/workspace/src") },
  },
  build: {
    outDir: "/tmp/crabby-portable",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input: path.resolve("/workspace/portable.html"),
    },
  },
});
