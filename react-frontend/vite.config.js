import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server:{
    proxy:{
      '/personal-cloud':{
        target: 'http://localhost:3000', // Your backend server
        changeOrigin: false,               // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/personal-cloud/, ''),
      },
      '/personal-live-cloud':{
        target:'ws://localhost:3000',
        changeOrigin: false,               // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/personal-live-cloud/, ''),
      }
    }
  }
})
