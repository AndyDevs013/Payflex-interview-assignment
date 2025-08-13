const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// In-memory storage (in production, use a database)
let testResults = [];
let pipelineData = [];

// API Routes

// Get all test results and pipeline data
app.get('/api/test-results', (req, res) => {
    res.json({
        testResults,
        pipelineData
    });
});

// Add new test results (from Jenkins or CI)
app.post('/api/test-results', (req, res) => {
    try {
        const { results, pipeline } = req.body;
        
        if (results) {
            if (Array.isArray(results)) {
                results.forEach(result => {
                    result.id = Date.now() + Math.random();
                    result.timestamp = result.timestamp || new Date().toISOString();
                    testResults.push(result);
                });
            } else {
                results.id = Date.now() + Math.random();
                results.timestamp = results.timestamp || new Date().toISOString();
                testResults.push(results);
            }
        }
        
        if (pipeline) {
            pipeline.id = Date.now() + Math.random();
            pipeline.timestamp = pipeline.timestamp || new Date().toISOString();
            pipelineData.push(pipeline);
        }
        
        res.json({ 
            success: true, 
            message: 'Test results added successfully',
            totalTests: testResults.length,
            totalPipelines: pipelineData.length
        });
    } catch (error) {
        console.error('Error adding test results:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Jenkins webhook endpoint
app.post('/api/jenkins-webhook', (req, res) => {
    try {
        console.log('Received Jenkins webhook:', req.body);
        
        const { build, tests } = req.body;
        
        // Create pipeline data from Jenkins build info
        if (build) {
            const pipelineRun = {
                id: Date.now() + Math.random(),
                name: build.jobName || 'Unknown Job',
                status: build.result === 'SUCCESS' ? 'success' : 
                       build.result === 'FAILURE' ? 'failed' : 'running',
                tests: {
                    passed: tests?.passed || 0,
                    failed: tests?.failed || 0,
                    skipped: tests?.skipped || 0
                },
                duration: build.duration ? `${Math.floor(build.duration / 1000)}s` : '0s',
                timestamp: new Date().toISOString(),
                framework: build.framework || 'jenkins'
            };
            pipelineData.push(pipelineRun);
        }
        
        // Add individual test results if provided
        if (tests && tests.results) {
            tests.results.forEach(test => {
                const testResult = {
                    id: Date.now() + Math.random(),
                    name: test.name || test.className,
                    framework: test.framework || 'jenkins',
                    status: test.status === 'PASSED' ? 'passed' : 
                           test.status === 'FAILED' ? 'failed' : 'skipped',
                    duration: test.duration ? `${test.duration}s` : '0s',
                    pipeline: build?.jobName || 'jenkins-pipeline',
                    timestamp: new Date().toISOString(),
                    output: test.stdout || test.message || '',
                    error: test.stderr || test.errorMessage || null
                };
                testResults.push(testResult);
            });
        }
        
        res.json({ success: true, message: 'Jenkins webhook processed' });
    } catch (error) {
        console.error('Error processing Jenkins webhook:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Clear all data (useful for testing)
app.delete('/api/test-results', (req, res) => {
    testResults = [];
    pipelineData = [];
    res.json({ success: true, message: 'All data cleared' });
});

// Export test results to JSON file
app.get('/api/export', async (req, res) => {
    try {
        const exportData = {
            testResults,
            pipelineData,
            exportedAt: new Date().toISOString()
        };
        
        const filename = `test-results-${new Date().toISOString().split('T')[0]}.json`;
        await fs.writeFile(filename, JSON.stringify(exportData, null, 2));
        
        res.download(filename);
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Serve the dashboard
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        testCount: testResults.length,
        pipelineCount: pipelineData.length
    });
});

app.listen(PORT, () => {
    console.log(`Dashboard server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Jenkins webhook: http://localhost:${PORT}/api/jenkins-webhook`);
});

module.exports = app;

