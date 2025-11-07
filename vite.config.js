
// // import path from "path";
// // import tailwindcss from "@tailwindcss/vite";
// // import react from "@vitejs/plugin-react";
// // import { defineConfig } from "vite";

// // // https://vite.dev/config/
// // export default defineConfig({
// //   plugins: [react(), tailwindcss()],
// //   resolve: {
// //     alias: {
// //       "@": path.resolve(__dirname, "./src"),
// //     },
// //   },
// //   server: {
// //     port: 5173, // 👈 Thêm dòng này để cố định port
// //     allowedHosts: [
// //       "gaiterless-ranae-unsensual.ngrok-free.dev",
// //     ],
// //   },
// // });

// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path'

// export default defineConfig({
//   plugins: [react()],
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
