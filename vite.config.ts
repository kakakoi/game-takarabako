import { defineConfig } from 'vite'

export default defineConfig({
  base: '/game-takarabako/', // リポジトリ名を正確に指定
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
}) 