// frontend/vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // <--- Add this import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <--- Add this plugin
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});