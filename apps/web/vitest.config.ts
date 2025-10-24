import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react() as any],
  test: {
    environment: 'jsdom',
    // Only run unit tests; exclude Playwright e2e from Vitest
    include: ['tests/unit/**/*.test.ts'],
    setupFiles: [],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
