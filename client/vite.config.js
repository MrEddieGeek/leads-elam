import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esta línea es la clave mágica para Render:
  build: {
    outDir: '../dist',        // Render espera que el build salga en /dist del root
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    host: true
  }
})
