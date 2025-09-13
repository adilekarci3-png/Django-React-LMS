// vite.config.ts (ya da vite.config.js)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // Frontend'de /api ile başlayan tüm istekleri Django'ya yönlendir
      '/api': {
        target: 'http://127.0.0.1:8000', // DİKKAT: http, https değil
        changeOrigin: true,
        secure: false,
        // Gerekirse path rewrite (şu an gerek yok):
        // rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  optimizeDeps: {
    include: [
      'date-fns/locale/tr',
      'date-fns/_lib/format/longFormatters',
      '@ckeditor/ckeditor5-react',
      '@ckeditor/ckeditor5-build-classic',
    ],
  },
});
