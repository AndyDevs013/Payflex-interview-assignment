const { defineConfig } = require('cypress');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const createEsbuildPlugin = require('@badeball/cypress-cucumber-preprocessor/esbuild');
const fs = require('fs');
const path = require('path');

module.exports = defineConfig({
  e2e: {
    retries: { runMode: 2, openMode: 0 },
    async setupNodeEvents(on, config) {
      // Cucumber preprocessor
      await preprocessor.addCucumberPreprocessorPlugin(on, config);

      // Esbuild bundler
      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin.default(config)],
        })
      );

      // Load environment-specific config (default to 'uat' if not provided)
      const environment = config.env.environment || 'uat';
      if (environment) {
        const envFilePath = path.join(__dirname, 'environments', `cypress.env.${environment}.json`);
        if (fs.existsSync(envFilePath)) {
          const envConfig = JSON.parse(fs.readFileSync(envFilePath, 'utf8'));
          Object.assign(config.env, envConfig);
          console.log(`Loaded environment config: ${environment}`);
        } else {
          console.warn(`Environment config file not found: ${envFilePath}. Provide --env environment=<name> or add the file.`);
        }
      }

      // Validate required environment variables
      if (!config.env.users || !config.env.users.testUser) {
        throw new Error('Missing required environment configuration: users.testUser not found. Ensure environments/cypress.env.' + environment + '.json contains users.testUser or pass --env environment=<name>.');
      }

      // Load environment variables with validation
      config.baseUrl = config.env.customerPortalUrl 
      config.viewportWidth = config.env.viewportWidth || 1280;
      config.viewportHeight = config.env.viewportHeight || 720;
      config.defaultCommandTimeout = config.env.defaultTimeout || 10000;
      config.video = config.env.enableVideo !== false;

      return config;
    },
    specPattern: 'cypress/e2e/features/**/*.feature',
    supportFile: 'cypress/support/e2e.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    chromeWebSecurity: false,
    experimentalStudio: true
  },
});
