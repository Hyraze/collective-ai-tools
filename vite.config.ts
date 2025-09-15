import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
    return {
      plugins: [react()],
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
