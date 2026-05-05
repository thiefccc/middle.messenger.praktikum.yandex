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
    proxy: {
      "/api": {
        target: "https://ya-praktikum.tech",
        changeOrigin: true,
        secure: true,
        // Browsers refuse Domain=ya-praktikum.tech for localhost responses.
        cookieDomainRewrite: "localhost",
        configure: (proxy) => {
          proxy.on("proxyRes", (proxyRes) => {
            const setCookie = proxyRes.headers["set-cookie"];
            if (Array.isArray(setCookie)) {
              proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
                cookie
                  // Drop Secure so the cookie persists on http://localhost.
                  .replace(/;\s*Secure/gi, "")
                  // SameSite=None requires Secure; downgrade to Lax for local dev.
                  .replace(/;\s*SameSite=None/gi, "; SameSite=Lax"),
              );
            }
          });
        },
      },
    },
  },
});
