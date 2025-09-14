import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
    return {
      define: {
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2020',
        minify: 'esbuild',
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['typescript']
            }
          }
        }
      },
      server: {
        port: 3000,
        open: true
      }
    };
});
