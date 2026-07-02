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
      output: {
        // 벤더를 별도 청크로 — 배포(콘텐츠 수정)마다 바뀌는 건 작은 앱 청크뿐이라
        // 재방문·재배포 시 three/react 대용량은 브라우저 캐시(304)로 해결된다.
        // postprocessing은 lazy Effects 청크에 남도록 여기 넣지 않는다(모바일 미다운로드 유지).
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
        },
      },
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
