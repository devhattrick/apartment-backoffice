import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

const packageJson = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8')) as {
  version?: string
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version ?? '0.0.0'),
  },
})
