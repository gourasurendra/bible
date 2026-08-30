import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "BibleVerse",
        short_name: "BibleVerse",
        description: "Read. Reflect. Grow.",
        theme_color: "#b08a43",
        background_color: "#f7f3eb",
        display: "standalone",
        start_url: "/"
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/bible-api\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "bible-api",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ]
      }
    })
  ]
});