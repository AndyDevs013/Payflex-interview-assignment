const { Stagehand } = require('@browserbasehq/stagehand');

function createStagehand() {
  const modelName = process.env.STAGEHAND_MODEL || 'openai/gpt-4o-mini';
  return new Stagehand({
    env: 'LOCAL',
    modelName,
    modelClientOptions: {
      apiKey: process.env.OPENAI_API_KEY || '',
    },
  });
}

module.exports = { createStagehand };


