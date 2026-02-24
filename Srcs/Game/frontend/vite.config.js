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
  console.log('HTTPS enabled')
} else {
  console.warn('SSL certificates not found, running in HTTP mode')
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    host: true,
    https: httpsConfig,
	//https: false, // <--- FORCE HTTP FOR PWA TESTING
  },
})
