// vite.config.js
import { defineConfig } from 'vite';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import path from 'path';

// Custom plugin to copy content.js and background.js directly
const copyContentAndBackgroundPlugin = () => {
  return {
    name: 'copy-content-background',
    writeBundle() {
      // Ensure the src directory exists in dist
      if (!fs.existsSync('dist/src')) {
        fs.mkdirSync('dist/src', { recursive: true });
      }
      
      // copy utils.js inside dist/src/content.js because this file cannot access utils.js functions using import()
      // Read content.js and utils.js
      let contentJs = fs.readFileSync(
        path.resolve(__dirname, 'src/content.js'),
        'utf-8'
      );
      
      let utilsJs = fs.readFileSync(
        path.resolve(__dirname, 'src/utils.js'),
        'utf-8'
      );
      
      // Remove export statements from utils.js
      utilsJs = utilsJs.replace(/export\s+function\s+/g, 'function ');
      utilsJs = utilsJs.replace(/export\s+const\s+/g, 'const ');
      
      // Remove export object at bottom of file
      utilsJs = utilsJs.replace(/\/\/ Export all functions and constants as a single object[\s\S]*?\};/g, '');
      
      // Remove any import statements from content.js
      contentJs = contentJs.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
      
      // Combine utils.js and content.js
      const combinedJs = `// WCAG Contrast Checker - Combined content.js with utils.js

// Utils.js functions
${utilsJs}

// Content.js code
${contentJs}`;
      
      // Write combined file to dist
      fs.writeFileSync(
        path.resolve(__dirname, 'dist/src/content.js'),
        combinedJs
      );
 
      // copy background.js
      fs.copyFileSync(
        path.resolve(__dirname, 'src/background.js'),
        path.resolve(__dirname, 'dist/src/background.js')
      );
      
      console.log('\u2713 Copied and processed content.js and background.js');
    }
  };
};

export default defineConfig({
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
      ],
    },
  },
  base: './', // Use relative paths
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'src/index.html'),
        popup: resolve(__dirname, 'src/popup.js'),
      },
      output: {
        entryFileNames: 'src/[name].js',
        chunkFileNames: 'src/[name].js',
        assetFileNames: 'src/[name].[ext]'
      }
    },
    // Copy extension files to dist folder
    copyPublicDir: true
  },
  plugins: [copyContentAndBackgroundPlugin()],
  publicDir: 'public'
});