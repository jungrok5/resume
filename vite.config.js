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
        // Static entry points:
        //   index.html       → document résumé (기본·ATS·상세) = default landing (SEO-first)
        //   interactive.html → the scroll-driven 3D WebGL experience (lazy, heavy)
        //   linkedin.html    → private copy-paste helper (noindex, not linked)
        main: resolve(__dirname, 'index.html'),
        interactive: resolve(__dirname, 'interactive.html'),
        linkedin: resolve(__dirname, 'linkedin.html'),
      },
    },
  },
  server: { port: 5173, host: true },
})
