// Dashboard JavaScript - Test Results Management
class TestDashboard {
    constructor() {
        this.testData = [];
        this.pipelineData = [];
        this.charts = {};
        this.currentFilter = {
            status: 'all',
            framework: 'all',
            search: ''
        };
        
        this.init();
    }

    init() {
        this.loadMockData();
        this.initializeCharts();
        this.updateLastUpdated();
        
        // Auto-refresh every 30 seconds
        setInterval(() => {
            this.refreshDashboard();
        }, 30000);
    }

    loadMockData() {
        // Initialize empty data arrays
        this.testData = [];
        this.pipelineData = [];
        
        // Load data from API or local storage if available
        this.loadDataFromAPI();
    }

    async loadDataFromAPI() {
        try {
            // Check if API is available
            const response = await fetch('/api/test-results');
            if (response.ok) {
                const data = await response.json();
                this.testData = data.testResults || [];
                this.pipelineData = data.pipelineData || [];
            }
        } catch (error) {
            console.log('API not available, starting with empty dashboard');
        }
        
        // Update UI with loaded data
        this.updateDashboard();
    }

    updateDashboard() {
        this.updateSummaryCards();
        this.renderPipelineList();
        this.renderTestResults();
        this.updateCharts();
    }

    updateCharts() {
        if (this.charts.overview) {
            this.updateOverviewChartData();
        }
        if (this.charts.framework) {
            this.updateFrameworkChartData();
        }
    }

    updateOverviewChartData() {
        // Calculate daily test results for the last 7 days
        const days = [];
        const passedData = [];
        const failedData = [];
        const skippedData = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            days.push(date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' }));
            
            const dayTests = this.testData.filter(test => {
                const testDate = new Date(test.timestamp);
                return testDate >= dayStart && testDate <= dayEnd;
            });
            
            passedData.push(dayTests.filter(t => t.status === 'passed').length);
            failedData.push(dayTests.filter(t => t.status === 'failed').length);
            skippedData.push(dayTests.filter(t => t.status === 'skipped').length);
        }
        
        this.charts.overview.data.labels = days;
        this.charts.overview.data.datasets[0].data = passedData;
        this.charts.overview.data.datasets[1].data = failedData;
        this.charts.overview.data.datasets[2].data = skippedData;
        this.charts.overview.update();
    }

    updateFrameworkChartData() {
        const frameworkCounts = this.getFrameworkCounts();
        this.charts.framework.data.labels = Object.keys(frameworkCounts);
        this.charts.framework.data.datasets[0].data = Object.values(frameworkCounts);
        this.charts.framework.update();
    }

    initializeCharts() {
        this.initOverviewChart();
        this.initFrameworkChart();
    }

    initOverviewChart() {
        const ctx = document.getElementById('overviewChart').getContext('2d');
        
        // Initialize with empty data - will be populated when data is received
        const days = [];
        const passedData = [];
        const failedData = [];
        const skippedData = [];
        
        // Generate last 7 days labels
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' }));
            passedData.push(0);
            failedData.push(0);
            skippedData.push(0);
        }

        this.charts.overview = new Chart(ctx, {
            type: 'line',
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Passed',
                        data: passedData,
                        borderColor: '#27ae60',
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Failed',
                        data: failedData,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Skipped',
                        data: skippedData,
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initFrameworkChart() {
        const ctx = document.getElementById('frameworkChart').getContext('2d');
        
        const frameworkCounts = this.getFrameworkCounts();
        
        this.charts.framework = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(frameworkCounts),
                datasets: [{
                    data: Object.values(frameworkCounts),
                    backgroundColor: [
                        '#3498db',
                        '#9b59b6',
                        '#e67e22',
                        '#1abc9c'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    getFrameworkCounts() {
        const counts = {};
        this.testData.forEach(test => {
            counts[test.framework] = (counts[test.framework] || 0) + 1;
        });
        return counts;
    }

    updateSummaryCards() {
        const stats = this.calculateStats();
        
        document.getElementById('passedTests').textContent = stats.passed;
        document.getElementById('failedTests').textContent = stats.failed;
        document.getElementById('skippedTests').textContent = stats.skipped;
        document.getElementById('executionTime').textContent = stats.totalTime;

        // Update trends (mock data for now)
        document.getElementById('passedTrend').textContent = '+12%';
        document.getElementById('failedTrend').textContent = '-5%';
        document.getElementById('skippedTrend').textContent = '+2%';
        document.getElementById('timeTrend').textContent = '-8%';
    }

    calculateStats() {
        const stats = {
            passed: 0,
            failed: 0,
            skipped: 0,
            totalTime: 0
        };

        this.testData.forEach(test => {
            stats[test.status]++;
            // Convert duration to seconds for calculation
            const duration = parseFloat(test.duration);
            if (!isNaN(duration)) {
                stats.totalTime += duration;
            }
        });

        stats.totalTime = `${stats.totalTime.toFixed(1)}s`;
        return stats;
    }

    renderPipelineList() {
        const container = document.getElementById('pipelineList');
        container.innerHTML = '';

        if (this.pipelineData.length === 0) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state';
            emptyState.innerHTML = `
                <p style="text-align: center; padding: 2rem; color: #666;">
                    No pipeline runs available. Pipelines will appear here when tests are executed.
                </p>
            `;
            container.appendChild(emptyState);
            return;
        }

        this.pipelineData.forEach(pipeline => {
            const item = document.createElement('div');
            item.className = 'pipeline-item';
            
            const total = pipeline.tests.passed + pipeline.tests.failed + pipeline.tests.skipped;
            const successRate = total > 0 ? Math.round((pipeline.tests.passed / total) * 100) : 0;

            item.innerHTML = `
                <div class="pipeline-status ${pipeline.status}"></div>
                <div class="pipeline-info">
                    <h4>${pipeline.name}</h4>
                    <p>${pipeline.framework.charAt(0).toUpperCase() + pipeline.framework.slice(1)} • ${successRate}% success rate</p>
                </div>
                <div class="pipeline-metrics">
                    <div class="metric">
                        <i class="fas fa-check-circle text-success"></i>
                        <span>${pipeline.tests.passed}</span>
                    </div>
                    <div class="metric">
                        <i class="fas fa-times-circle text-danger"></i>
                        <span>${pipeline.tests.failed}</span>
                    </div>
                    <div class="metric">
                        <i class="fas fa-exclamation-triangle text-warning"></i>
                        <span>${pipeline.tests.skipped}</span>
                    </div>
                </div>
                <div class="pipeline-time">
                    ${this.formatRelativeTime(pipeline.timestamp)}
                </div>
            `;

            container.appendChild(item);
        });
    }

    renderTestResults() {
        const tbody = document.getElementById('testResultsBody');
        tbody.innerHTML = '';

        let filteredData = this.testData;

        // Apply filters
        if (this.currentFilter.status !== 'all') {
            filteredData = filteredData.filter(test => test.status === this.currentFilter.status);
        }

        if (this.currentFilter.search) {
            filteredData = filteredData.filter(test => 
                test.name.toLowerCase().includes(this.currentFilter.search.toLowerCase())
            );
        }

        if (filteredData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" style="text-align: center; padding: 2rem; color: #666;">
                    ${this.testData.length === 0 ? 
                        'No test results available. Run tests to see results here.' : 
                        'No tests match the current filters.'}
                </td>
            `;
            tbody.appendChild(row);
            return;
        }

        filteredData.forEach(test => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${test.name}</td>
                <td><span class="framework-badge">${test.framework}</span></td>
                <td><span class="status-badge ${test.status}">${test.status}</span></td>
                <td>${test.duration}</td>
                <td>${test.pipeline}</td>
                <td>${this.formatRelativeTime(test.timestamp)}</td>
                <td>
                    <button class="action-btn" onclick="dashboard.showTestDetails(${test.id})">
                        View Details
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    showTestDetails(testId) {
        const test = this.testData.find(t => t.id === testId);
        if (!test) return;

        document.getElementById('modalTestName').textContent = test.name;
        document.getElementById('modalStatus').textContent = test.status;
        document.getElementById('modalStatus').className = `status-badge ${test.status}`;
        document.getElementById('modalDuration').textContent = test.duration;
        document.getElementById('modalFramework').textContent = test.framework;
        document.getElementById('modalPipeline').textContent = test.pipeline;
        document.getElementById('modalOutput').textContent = test.output;

        const errorSection = document.getElementById('modalErrorSection');
        if (test.error) {
            document.getElementById('modalError').textContent = test.error;
            errorSection.style.display = 'block';
        } else {
            errorSection.style.display = 'none';
        }

        document.getElementById('testModal').style.display = 'block';
    }

    formatRelativeTime(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleString('en-ZA');
    }

    async refreshDashboard() {
        // Add visual feedback
        const refreshBtn = document.querySelector('.refresh-btn');
        refreshBtn.classList.add('loading');
        
        try {
            await this.loadDataFromAPI();
            this.updateLastUpdated();
        } catch (error) {
            console.error('Failed to refresh dashboard:', error);
        } finally {
            setTimeout(() => {
                refreshBtn.classList.remove('loading');
            }, 1000);
        }
    }

    updateOverviewChart() {
        const period = document.getElementById('overviewPeriod').value;
        // In a real implementation, this would fetch data for the selected period
        console.log(`Updating chart for ${period} days`);
    }

    filterPipelines() {
        const filter = document.getElementById('pipelineFilter').value;
        // Filter pipeline display based on selection
        console.log(`Filtering pipelines: ${filter}`);
        this.renderPipelineList();
    }

    filterTests() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchFilter = document.getElementById('testFilter').value;
        
        this.currentFilter.status = statusFilter;
        this.currentFilter.search = searchFilter;
        
        this.renderTestResults();
    }

    // Method to receive test results from Jenkins or other CI systems
    addTestResults(newResults) {
        if (!Array.isArray(newResults)) {
            newResults = [newResults];
        }

        newResults.forEach(result => {
            // Generate ID if not provided
            if (!result.id) {
                result.id = Date.now() + Math.random();
            }
            
            // Ensure timestamp is a Date object
            if (typeof result.timestamp === 'string') {
                result.timestamp = new Date(result.timestamp);
            }
            
            // Add to test data
            this.testData.push(result);
        });

        // Update dashboard
        this.updateDashboard();
    }

    // Method to add pipeline run data
    addPipelineRun(pipelineData) {
        if (!pipelineData.id) {
            pipelineData.id = Date.now() + Math.random();
        }
        
        if (typeof pipelineData.timestamp === 'string') {
            pipelineData.timestamp = new Date(pipelineData.timestamp);
        }

        this.pipelineData.push(pipelineData);
        this.updateDashboard();
    }

    // Method to clear all data (useful for testing)
    clearAllData() {
        this.testData = [];
        this.pipelineData = [];
        this.updateDashboard();
    }
}

// Global functions for HTML onclick handlers
function refreshDashboard() {
    dashboard.refreshDashboard();
}

function updateOverviewChart() {
    dashboard.updateOverviewChart();
}

function filterPipelines() {
    dashboard.filterPipelines();
}

function filterTests() {
    dashboard.filterTests();
}

function closeModal() {
    document.getElementById('testModal').style.display = 'none';
}

// Close modal when clicking outside of it
window.onclick = function(event) {
    const modal = document.getElementById('testModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Initialize dashboard when DOM is loaded
let dashboard;
document.addEventListener('DOMContentLoaded', function() {
    dashboard = new TestDashboard();
});

// API Integration Functions (for future Jenkins integration)
class DashboardAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async fetchTestResults(filters = {}) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`${this.baseUrl}/api/test-results?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch test results:', error);
            return null;
        }
    }

    async fetchPipelineData() {
        try {
            const response = await fetch(`${this.baseUrl}/api/pipelines`);
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch pipeline data:', error);
            return null;
        }
    }

    async submitTestResults(results) {
        try {
            const response = await fetch(`${this.baseUrl}/api/test-results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(results)
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to submit test results:', error);
            return null;
        }
    }
}

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestDashboard, DashboardAPI };
}
