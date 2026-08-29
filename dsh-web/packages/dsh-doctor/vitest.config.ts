import { defineConfig } from 'vitest/config'
import viteTsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [viteTsconfigPaths()],
  test: {
    environment: 'node',
    include: ['tests/**/*.spec.ts', 'tests/**/*.spec.tsx'],
    server: { deps: { inline: [/@deepseek-ai\//] } },
  },
})
