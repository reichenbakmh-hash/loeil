import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg"],
      manifest: {
        name: "L'oeil — veille géopolitique",
        short_name: "L'oeil",
        description: "Agrégation et cartographie d'événements géopolitiques en temps quasi réel",
        theme_color: "#0D1117",
        background_color: "#0D1117",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any" },
          { src: "icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "loeil-api-cache",
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 200, maxAgeSeconds: 21600 },
            },
          },
        ],
      },
    }),
  ],
});
