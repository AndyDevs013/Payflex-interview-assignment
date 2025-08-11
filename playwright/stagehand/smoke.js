const { createStagehand } = require('./config');

(async () => {
  const stagehand = createStagehand();
  await stagehand.init();
  const page = stagehand.page;

  const html = `<!doctype html><html><head><meta charset="utf-8" />
  <title>Stagehand Minimal Demo</title></head><body>
  <h1>Hello</h1><button id="go">Go</button>
  </body></html>`;

  await page.goto('data:text/html,' + encodeURIComponent(html));

  if (process.env.OPENAI_API_KEY) {
    await page.act("Click the 'Go' button");
  } else {
    console.log('Skipping Stagehand act(): set OPENAI_API_KEY to enable LLM actions.');
  }

  const title = await page.title();
  console.log('Page title:', title);

  await stagehand.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});


