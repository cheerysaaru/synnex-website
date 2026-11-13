import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SPA fallback: direct URL navigation (e.g. /company/about) loads index.html
// so initialPage() in App.jsx can map the pathname to a route.
const spaFallback = () => ({
  name: 'spa-fallback',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      if (
        req.method === 'GET' &&
        !url.includes('.') &&
        !url.startsWith('/@') &&
        !url.startsWith('/api')
      ) {
        req.url = '/index.html';
      }
      next();
    });
  },
  configurePreviewServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = req.url || '';
      if (
        req.method === 'GET' &&
        !url.includes('.') &&
        !url.startsWith('/@') &&
        !url.startsWith('/api')
      ) {
        req.url = '/index.html';
      }
      next();
    });
  },
});

export default defineConfig({
  // '/' locally; the GitHub Pages build sets VITE_BASE=/synnex-website/
  base: process.env.VITE_BASE || '/',
  plugins: [react(), spaFallback()],
  server: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: false,
    proxy: {
      // Same-origin /api calls so the httpOnly SameSite=Lax session cookie works
      // without CORS or cross-port cookie problems.
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 3001,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
});
