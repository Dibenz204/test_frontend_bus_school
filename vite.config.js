


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // ← THÊM DÒNG NÀY
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss() // ← THÊM DÒNG NÀY
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})
