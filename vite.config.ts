import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // o Firebase (auth + firestore) é um bloco único de ~580 kB (~140 kB gzip);
    // dividi-lo cria dependência circular entre arquivos e o app não abre
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        // bibliotecas em arquivos próprios: mudam pouco e ficam em cache
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('/firebase/') || id.includes('/@firebase/')) return 'firebase'
          if (id.includes('/@mui/') || id.includes('/@emotion/')) return 'mui'
          if (/\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
})
