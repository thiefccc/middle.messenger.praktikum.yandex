import { defineConfig } from "vite";
import { resolve } from "path";
import dotenv from "dotenv";

dotenv.config();

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    port: Number(process.env.PORT) || 3000,
    open: true,
  },
});
