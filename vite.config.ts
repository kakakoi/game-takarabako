import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // GitHub Pagesでの相対パスを使用
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
  }
}) 