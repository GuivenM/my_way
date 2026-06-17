import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inclure tous les assets référencés dans le manifest
      includeAssets: ['favicon.ico', 'logo-192.png', 'logo-512.png', 'logo.png'],
      manifest: {
        name: 'Personal OS',
        short_name: 'Personal OS',
        description: 'Ton système de pilotage personnel',
        theme_color: '#7c6af7',
        background_color: '#0d0d0f',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',           // ← Ajouter explicitement
        lang: 'fr',          // ← Bonne pratique
        icons: [
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',       // ← 'any' et 'maskable' séparés
          },
          {
            src: 'logo-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',       // ← Corrigé : séparé
          },
          {
            src: 'logo-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable', // ← Corrigé : séparé
          },
        ],
        // Optionnel mais améliore le score PWA
        categories: ['productivity', 'utilities'],
      },
      workbox: {
        skipWaiting: true,      // ← Active le nouveau SW immédiatement
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Cache API : NetworkFirst avec fallback
          {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
              cacheableResponse: { statuses: [0, 200] }, // ← Ajouter
            },
          },
          // Cache images : CacheFirst (rarement modifiées)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }, // 30 jours
            },
          },
          // Cache fonts Google / locales
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 }, // 1 an
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Utile en dev pour tester le SW sans build
      devOptions: {
        enabled: false, // Mettre true temporairement si tu veux tester en dev
      },
    }),
  ],
  server: {
    proxy: {
      '/api': { target: 'http://localhost:8000/my_way', changeOrigin: true }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  }
})