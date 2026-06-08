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
  server: {
    port: 5173,
    strictPort: true,
  },
})
