import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      // the piano and guitar recordings are cached with the app, so ear training works offline
      workbox: { globPatterns: ["**/*.{js,css,html,mp3}"] },
      manifest: {
        name: "Music Theory Quiz",
        short_name: "Theory Quiz",
        start_url: "/",
        display: "standalone",
        background_color: "#0f1e2b",
        theme_color: "#0f1e2b",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ]
});
