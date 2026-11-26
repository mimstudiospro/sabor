import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vitest/config'

// https://vite.dev/config/
export default defineConfig({
  // Relative base: the same build serves at /sabor/ on github.io
  // and at the root once the custom domain (sabor.mimstudiospro.com) is live.
  base: './',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
    include: ['src/test/**/*.test.ts'],
  },
})
