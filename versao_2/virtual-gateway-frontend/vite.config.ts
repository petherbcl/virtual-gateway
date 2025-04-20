import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANTE: adicionar isto
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8090',
      '/ws': {
        target: 'http://localhost:8090',
        ws: true
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
      ],
      define: {
        global: 'globalThis',
      },
    },
  },
})
