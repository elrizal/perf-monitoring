import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Replace <YOUR_REPO_NAME> with your GitHub repository name exactly
  base: 'perf-monitoring',
})