import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Relative base so the same build works on Vercel (root) AND GitHub Pages
  // (served from /<repo>/). Single-page app, so no router base needed.
  base: './',
  server: { port: 5173, host: true },
})
