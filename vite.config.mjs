import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      react()
    ],
    define: {
      'process.env.NEXT_PUBLIC_SUPABASE_URL': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_URL || ''),
      'process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY': JSON.stringify(env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''),
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    build: {
      target: 'es2022',
      cssMinify: true,
      modulePreload: { polyfill: false },
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // Food & Exercise Datasets — isolated so they don't bloat core app execution
            if (id.includes('calyxo10kFoods.json') || id.includes('calyxoFoodDatabase') || id.includes('calyxoFoodDiscoveryData')) {
              return 'data-foods';
            }

            if (id.includes('node_modules')) {
              if (id.includes('three') || id.includes('@react-three')) {
                return 'vendor-three';
              }
              if (id.includes('framer-motion') || id.includes('gsap')) {
                return 'vendor-animation';
              }
              if (id.includes('@supabase')) {
                return 'vendor-supabase';
              }
              if (id.includes('recharts')) {
                return 'vendor-charts';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              if (id.includes('@google/generative-ai') || id.includes('react-markdown')) {
                return 'vendor-ai';
              }
              if (id.includes('papaparse')) {
                return 'vendor-parser';
              }
              return 'vendor-core';
            }
          }
        }
      }
    }
  };
});
