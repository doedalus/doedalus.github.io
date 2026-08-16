import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = Number(env.PORT || env.VITE_PORT || 3000)

  return {
  plugins: [react()],
  server: {
    port,
    strictPort: true,
    host: '127.0.0.1',
  },
  preview: {
    port,
    strictPort: true,
    host: '127.0.0.1',
  },
}
