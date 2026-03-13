// Vite configuration for MaHalla Stunden
// Sets up React, Tailwind CSS, and PWA support

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
      manifest: {
        name: 'MaHalla Stunden',
        short_name: 'Stunden',
        description: 'Hour tracking for Mahalla Event Space',
        theme_color: '#FB0007',
        background_color: '#FFFFFF',
        display: 'standalone',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        // Show offline fallback page when there is no network connection
        navigateFallback: null,
        runtimeCaching: []
      }
    })
  ]
})
