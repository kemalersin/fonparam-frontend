import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // tüm ağ arayüzlerini dinle
    port: 5173,
    strictPort: true, // port meşgulse hata ver
  }
})
