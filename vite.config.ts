import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// ----------------------------------------------------------------------

export default defineConfig({
  plugins: [react()],
  
  // Resuelve alias para facilitar la importación de módulos
  resolve: {
    alias: [
      {
        // Alias para módulos instalados con "~"
        find: /^~(.+)/,
        replacement: path.resolve(__dirname, 'node_modules/$1'),
      },
      {
        // Alias para importar archivos desde "src"
        find: /^src\/(.+)/,
        replacement: path.resolve(__dirname, 'src/$1'),
      },
    ],
  },

  // Configuración del servidor de desarrollo
  server: {
    port: 3001, // Cambia el puerto si lo necesitas
  },

  // Configuración del servidor de vista previa de producción
  preview: {
    port: 3001,
  },

  // Optimización del build
  build: {
    // Dividir los módulos grandes en chunks para mejorar el rendimiento
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return id.toString().split('node_modules/')[1].split('/')[0].toString();
          }
        }
      }
    },
    
    // Aumentar el límite de advertencia de tamaño de chunk
    chunkSizeWarningLimit: 1000, // En kB; ajusta según tus necesidades
    
    // Configuración adicional para mejorar el rendimiento
    cssCodeSplit: true,  // Dividir el CSS para módulos individuales
    sourcemap: true,  // Habilita los sourcemaps para depuración en producción
    minify: 'esbuild',  // Usa esbuild para minificar y mejorar el rendimiento
  },
});
