import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,                 // écoute sur 0.0.0.0
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 200,
    },
    hmr: {
      host: 'localhost',        // ou l’IP de ta machine hôte
      port: 5173,               // ou 24678 si tu préfères un port HMR dédié
    },
  },
});