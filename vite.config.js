import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the same build works on Vercel (root) AND GitHub Pages
  // (served from /<repo>/). Relative asset paths work for both HTML entries.
  base: './',
  build: {
    rollupOptions: {
      input: {
        // Two static entry points:
        //   index.html       → document résumé (4 views) = default landing (SEO-first)
        //   interactive.html → the scroll-driven 3D WebGL experience (lazy, heavy)
        main: resolve(__dirname, 'index.html'),
        interactive: resolve(__dirname, 'interactive.html'),
      },
    },
  },
  server: { port: 5173, host: true },
})
