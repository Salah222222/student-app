import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// The API base URL is read at runtime from import.meta.env.VITE_API_BASE_URL
// (see .env.example). It is NOT hardcoded here so the same build can point
// at staging/production by swapping the env file before `npm run build`.

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "منصتي التعليمية",
        short_name: "منصتي",
        description: "تابع كورساتك ودروسك في أي وقت",
        theme_color: "#0d7a68",
        background_color: "#f5f7f7",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "ar",
        start_url: "/",
        scope: "/",
        icons: [
          {
            src: "icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // Static build assets (JS/CSS/fonts/images emitted by Vite) — cache-first.
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        runtimeCaching: [
          {
            // Any GET call to the JSON API — network-first so a student
            // always sees fresh course/progress data when online, but the
            // app still renders the last-known response when offline.
            urlPattern: ({ url, request }) =>
              request.method === "GET" && url.pathname.includes("/api/v1/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-get-cache",
              networkTimeoutSeconds: 6,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Vimeo player iframe + any other cross-origin static asset —
            // cache-first, long-lived.
            urlPattern: ({ url }) =>
              url.origin !== self.location.origin &&
              /\.(?:png|jpg|jpeg|svg|webp|woff2?)$/.test(url.pathname),
            handler: "CacheFirst",
            options: {
              cacheName: "static-remote-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
