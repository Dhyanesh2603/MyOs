import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@core': fileURLToPath(new URL('./src/core', import.meta.url)),
      '@shell': fileURLToPath(new URL('./src/shell', import.meta.url)),
      '@design': fileURLToPath(new URL('./src/design', import.meta.url)),
      '@apps': fileURLToPath(new URL('./src/apps', import.meta.url)),
      "@contracts": fileURLToPath(new URL('./src/contracts', import.meta.url)),
    },
  },
  server: {
    port: 3000,
    open: false,
  },
});
