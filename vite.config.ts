import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {
    port: 3001,
    // Configuración para redirigir todas las rutas a index.html en aplicaciones SPA
    fs: {
      allow: ['.'],
    },
    middlewareMode: true, // Esto habilita el modo middleware de Vite
  },
  preview: {
    port: 3001,
  },
});
