const fs = require('fs');
const path = require('path');
const axios = require('axios');

async function sendPlaywrightResults() {
  const reportPath = path.resolve(__dirname, 'test-results', 'report.json');
  if (!fs.existsSync(reportPath)) {
    console.warn('No report.json found at', reportPath);
    return;
  }

  const json = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const testResults = [];
  let totalPassed = 0, totalFailed = 0, totalSkipped = 0;

  (json.suites || []).forEach(suite => {
    (suite.specs || []).forEach(spec => {
      (spec.tests || []).forEach(test => {
        const outcome = test.outcome || test.status || 'skipped';
        const status = outcome === 'expected' || outcome === 'passed' ? 'passed' : (outcome === 'unexpected' || outcome === 'failed') ? 'failed' : 'skipped';
        if (status === 'passed') totalPassed++; else if (status === 'failed') totalFailed++; else totalSkipped++;
        const durationMs = (test.results?.[0]?.duration) || 0;
        testResults.push({
          name: `${spec.title} - ${test.title || ''}`.trim(),
          framework: 'playwright',
          status,
          duration: `${Math.round(durationMs / 100) / 10}s`,
          pipeline: process.env.JOB_NAME || 'local',
          timestamp: new Date().toISOString(),
          output: (test.results?.[0]?.stdout || []).join('\n'),
          error: (test.results?.[0]?.error?.message) || null
        });
      });
    });
  });

  const payload = {
    results: testResults,
    pipeline: {
      name: process.env.JOB_NAME || 'local',
      status: totalFailed > 0 ? 'failed' : 'success',
      tests: { passed: totalPassed, failed: totalFailed, skipped: totalSkipped },
      duration: `${Math.round(((json.duration) || 0) / 100) / 10}s`,
      framework: 'playwright'
    }
  };

  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:3000';
  const url = `${dashboardUrl.replace(/\/$/, '')}/api/test-results`;
  const resp = await axios.post(url, payload, { headers: { 'Content-Type': 'application/json' } });
  console.log('Posted results:', resp.status, resp.data);
}

if (require.main === module) {
  sendPlaywrightResults().catch(err => {
    console.error('Failed to send results:', err.message);
    process.exit(1);
  });
}

module.exports = sendPlaywrightResults;

