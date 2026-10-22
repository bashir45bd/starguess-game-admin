import tailwindcss from '@tailwindcss/vite';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  const disableHmr = (globalThis as any).process?.env?.DISABLE_HMR === 'true';
  return {
    base: './',
    plugins: [tailwindcss()],
    build: {
      rollupOptions: {
        input: 'admin.html',
      },
    },
    server: {
      proxy: {
        '/starguess-admin/api': { target: 'http://localhost', changeOrigin: true },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: !disableHmr,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: disableHmr ? null : {},
    },
  };
});
