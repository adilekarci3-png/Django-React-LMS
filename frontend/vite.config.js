import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ← path modülünü ekledik

export default defineConfig({
  base: './',  
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ← alias tanımı
    },
  },
  optimizeDeps: {
      include: [
      'date-fns/locale/tr',
      'date-fns/_lib/format/longFormatters',
      '@ckeditor/ckeditor5-react',
      '@ckeditor/ckeditor5-build-classic'
    ]
  },
});
