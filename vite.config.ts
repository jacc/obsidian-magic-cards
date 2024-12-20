import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, pathToFileURL } from 'url'
import path, { dirname } from 'path'
import { builtinModules } from 'module'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import manifest for plugin configuration
import manifest from './public/manifest.json' with { type: 'json' };

// Plugin configuration
const PLUGIN_PATH = path.join('dev-vault', '.obsidian', 'plugins', manifest.id);
const PLUGIN_URL = pathToFileURL(path.join(__dirname, PLUGIN_PATH)).toString();

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  const inProd = mode === 'production';

  return {
    plugins: [svelte(), tailwindcss()],
    resolve: {
      alias: {
        '@modules': path.resolve(__dirname, './src/modules'),
      }
    },
    build: {
      // Build as lib. W/o this, vite will try to build as an app
      lib: {
        entry: path.resolve(__dirname, './src/main.ts'),
        name: 'main',
        fileName: 'main.js',
        formats: ['cjs'],
      },
      minify: inProd,
      // inline sourcemaps in dev for debugging
      sourcemap: inProd ? false : 'inline',
      outDir: inProd ? './dist' : PLUGIN_PATH,
      emptyOutDir: inProd,
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, './src/main.ts'),
        },
        output: {
          entryFileNames: "main.js",
          assetFileNames: "styles.css",
          sourcemapBaseUrl: PLUGIN_URL,
        },
        external: [
          "obsidian",
          "electron",
          "@codemirror/autocomplete",
          "@codemirror/collab",
          "@codemirror/commands",
          "@codemirror/language",
          "@codemirror/lint",
          "@codemirror/search",
          "@codemirror/state",
          "@codemirror/view",
          "@lezer/common",
          "@lezer/highlight",
          "@lezer/lr",
          ...builtinModules,
        ]
      }
    }
  }
})
