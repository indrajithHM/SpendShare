import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "SpendShare.png"],
      manifest: {
        name: "SpendShare",
        short_name: "SpendShare",
        description: "Split expenses easily with friends",
        theme_color: "#198754",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/SpendShare.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/SpendShare.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ]
});
