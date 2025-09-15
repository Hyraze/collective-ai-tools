import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
    return {
      plugins: [
        react(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.ico', 'favicon-16x16.png', 'favicon-32x32.png', 'icons/icon-192x192.png', 'icons/icon-512x512.png'],
          manifest: {
            name: 'Collective AI Tools',
            short_name: 'AI Tools',
            description: 'A searchable, filterable directory of AI tools, built from the Collective AI Tools open-source list.',
            theme_color: '#121212',
            background_color: '#121212',
            display: 'standalone',
            scope: '/',
            start_url: '/',
            icons: [
              {
                src: 'icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any maskable'
              },
              {
                src: 'icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any maskable'
              }
            ]
          }
        })
      ],
      define: {
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      css: {
        postcss: './postcss.config.js',
      },
      build: {
        target: 'es2020',
        minify: 'esbuild' as const,
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
              ui: ['class-variance-authority', 'clsx', 'tailwind-merge'],
              icons: ['lucide-react']
            }
          }
        },
        chunkSizeWarningLimit: 1000
      },
      server: {
        port: 3000,
        open: true
      }
    };
});
