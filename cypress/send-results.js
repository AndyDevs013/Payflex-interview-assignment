const fs = require('fs');
const path = require('path');
const axios = require('axios');

const DASHBOARD_URL = process.env.DASHBOARD_URL || 'http://localhost:3000';

async function sendCypressResults() {
    try {
        console.log('Sending Cypress test results to dashboard...');
        
        // Read Cypress results
        const resultsDir = path.join(__dirname, 'cypress', 'results');
        const mochawesomeFile = path.join(resultsDir, 'mochawesome.json');
        
        if (!fs.existsSync(mochawesomeFile)) {
            console.log('No Cypress results file found');
            return;
        }
        
        const results = JSON.parse(fs.readFileSync(mochawesomeFile, 'utf8'));
        
        // Transform Cypress results to dashboard format
        const testResults = [];
        
        if (results.tests) {
            results.tests.forEach(test => {
                testResults.push({
                    name: test.title,
                    framework: 'cypress',
                    status: test.state === 'passed' ? 'passed' : 
                           test.state === 'failed' ? 'failed' : 'skipped',
                    duration: `${test.duration || 0}ms`,
                    pipeline: process.env.JOB_NAME || 'cypress-local',
                    output: test.body || '',
                    error: test.err ? test.err.message : null,
                    timestamp: new Date().toISOString()
                });
            });
        }
        
        // Create pipeline data
        const pipelineData = {
            name: process.env.JOB_NAME || 'cypress-local',
            status: results.stats.failures > 0 ? 'failed' : 'success',
            tests: {
                passed: results.stats.passes || 0,
                failed: results.stats.failures || 0,
                skipped: results.stats.skipped || 0
            },
            duration: `${Math.floor((results.stats.duration || 0) / 1000)}s`,
            timestamp: new Date().toISOString(),
            framework: 'cypress'
        };
        
        // Send to dashboard
        const payload = {
            results: testResults,
            pipeline: pipelineData
        };
        
        const response = await axios.post(`${DASHBOARD_URL}/api/test-results`, payload);
        
        console.log(`✅ Successfully sent ${testResults.length} test results to dashboard`);
        console.log(`Dashboard response:`, response.data);
        
    } catch (error) {
        console.error('❌ Failed to send results to dashboard:', error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
    }
}

// Run if called directly
if (require.main === module) {
    sendCypressResults();
}

module.exports = sendCypressResults;

