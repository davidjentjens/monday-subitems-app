import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  define: {
    'process.env.MONDAY_API_ENDPOINT': JSON.stringify(
      process.env.VITE_MONDAY_API_ENDPOINT || 'https://api.monday.com/v2',
    ),
    global: {},
  },
})
