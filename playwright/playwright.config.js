// Minimal config to emit JSON report to test-results/report.json
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/report.json' }],
  ],
});


