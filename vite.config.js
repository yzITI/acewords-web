import { sveltekit } from '@sveltejs/kit/vite'
import { SvelteKitPWA } from '@vite-pwa/sveltekit'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltekit(),
    SvelteKitPWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Acewords',
        short_name: 'Acewords',
        theme_color: '#4980e9',
        icons: [{
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        }, {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        }, {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        }]
      }
    })
  ]
})
