import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Load environment variables from .env
import dotenv from 'dotenv'
dotenv.config()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    // ✅ Use your Vite environment variable safely
    'process.env.VITE_API_KEY': JSON.stringify(process.env.VITE_API_KEY),
  },
})
