import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generates a legacy ES5 bundle + polyfills for older iOS Safari (13+)
    // modernPolyfills:true also injects polyfills into the MODERN bundle
    // so that current iPhones (iOS 14-17) also get missing APIs filled in.
    legacy({
      targets: ['iOS >= 13', 'defaults'],
      modernPolyfills: true,
    }),
  ],
  build: {
    // Split the huge 9.5MB bundle into smaller chunks iOS Safari can handle
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase is ~3-4MB alone — isolate it
          'firebase': ['firebase/app', 'firebase/auth'],
          // React core
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // UI + utilities
          'ui-vendor': ['lucide-react', 'react-hot-toast', 'zustand'],
          // i18n
          'i18n-vendor': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          // Socket + axios
          'network-vendor': ['socket.io-client', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
