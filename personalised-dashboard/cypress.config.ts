// cypress.config.ts
import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'v12o3k',
  e2e: {
    baseUrl: 'http://localhost:3000', // Next.js dev server
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
})
