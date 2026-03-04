import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { readFileSync, existsSync } from 'fs'

// Check for SSL certificates
const certPath = '/app/certs/server.crt'
const keyPath = '/app/certs/server.key'

let httpsConfig = false
if (existsSync(certPath) && existsSync(keyPath)) {
  httpsConfig = {
    cert: readFileSync(certPath),
    key: readFileSync(keyPath),
  }
  console.log('🔒 HTTPS enabled')
} else {
  console.warn('⚠️  SSL certificates not found, running in HTTP mode')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    https: httpsConfig,
    proxy: {
      // Proxy WebSocket: wss://localhost:5173/ws -> ws://backend:PORT/ws
      // BACKEND_HOST is the Docker service name (pong-backend-dev in Docker network)
      '/ws': {
        target: `http://${process.env.BACKEND_HOST || 'localhost'}:${process.env.VITE_PORT || 3000}`,
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
