import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Generates a legacy ES5 bundle + polyfills for older iOS Safari (13+)
    // This is the primary fix for "white screen on iPhone" issues
    legacy({
      targets: ['iOS >= 13', 'defaults'],
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
})
