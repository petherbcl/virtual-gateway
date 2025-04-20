import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    // faz com que `global` exista e aponte para window
    global: "window"
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8090',
      '/ws': {
        target: 'http://localhost:8090',
        ws: true,
      }
    }
  }
})
