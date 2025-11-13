import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path';
import fs from 'fs';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
      name: 'move-assets',
      closeBundle:  () => {
        const outputDir = path.resolve(__dirname, 'dist/');
        const targetDir = path.resolve(__dirname, '../heightLight-plug');
        fs.copyFileSync(path.join(outputDir, 'index.js'), path.join(targetDir, 'index.js'));
        fs.copyFileSync(path.join(outputDir, 'index.css'), path.join(targetDir, 'index.css'));
      },
    }],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        chunkFileNames: 'chunk.js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  server:{
    port: 3001
  }
})
