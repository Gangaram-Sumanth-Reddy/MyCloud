import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  cacheDir: '.vite',

  server: {
    port: 5173,
    strictPort: false,
  },

  preview: {
    allowedHosts: [
      'cloud-storage-frontend-o4io.onrender.com'
    ]
  }
})
