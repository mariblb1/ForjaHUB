import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

// Vitest não lê o electron.vite.config.ts — replica só os aliases que os testes usam.
export default defineConfig({
  resolve: {
    alias: {
      '@shared': resolve('src/shared'),
      '@': resolve('src/renderer/src')
    }
  }
})
