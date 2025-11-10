


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite' // ← THÊM DÒNG NÀY
// import path from 'path'

// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss() // ← THÊM DÒNG NÀY
//   ],
//   resolve: {
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     port: 5173,
//   },
//   build: {
//     outDir: 'dist',
//     sourcemap: false,
//   }
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force resolve React DOM đúng
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react/jsx-runtime'],
    // Force pre-bundle React DOM
    force: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
      // Thêm này
      strictRequires: true
    },
    // Rolldown specific
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 5173,
  },
})