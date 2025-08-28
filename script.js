class CompanyDirectory {
    constructor() {
        this.companies = [];
        this.filteredCompanies = [];
        this.uniqueQuestions = new Map(); // Map of questionId -> {title, difficulty, url}
        this.totalStats = {
            totalQuestions: 0,
            easyQuestions: 0,
            mediumQuestions: 0,
            hardQuestions: 0,
            avgQuestions: 0
        };
        this.init();
    }

    async init() {
        await this.loadCompanies();
        this.setupEventListeners();
        this.renderCompanies();
        this.updateStats();
    }

    async loadCompanies() {
        try {
            // First, try to load from company_list.txt
            const response = await fetch('company_list.txt');
            const text = await response.text();
            const companyNames = text.trim().split('\n').filter(name => name.trim());
            
            // Create company objects with metadata
            this.companies = companyNames.map(name => ({
                name: name.trim(),
                displayName: this.formatCompanyName(name.trim()),
                csvFile: `data/${name.trim()}.csv`,
                questionsCount: 0,
                easyCount: 0,
                mediumCount: 0,
                hardCount: 0,
                loaded: false
            }));

            this.filteredCompanies = [...this.companies];
            
            // Load question counts and difficulty breakdown for ALL companies
            await this.loadAllCompanyStats();
            
        } catch (error) {
            console.error('Error loading companies:', error);
            this.showError('Failed to load companies. Please check if company_list.txt exists.');
        }
    }

    async loadAllCompanyStats() {
        const loadingStats = document.getElementById('loadingStats');
        const loadingProgress = document.getElementById('loadingProgress');
        const loadingCount = document.getElementById('loadingCount');
        const totalCount = document.getElementById('totalCount');
        
        // Show loading indicator
        loadingStats.style.display = 'block';
        totalCount.textContent = this.companies.length;
        
        let loadedCount = 0;
        const batchSize = 5; // Process in batches to avoid overwhelming the browser
        
        for (let i = 0; i < this.companies.length; i += batchSize) {
            const batch = this.companies.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (company) => {
                try {
                    const response = await fetch(company.csvFile);
                    if (response.ok) {
                        const text = await response.text();
                        const lines = text.trim().split('\n');
                        
                        if (lines.length > 1) { // Has header + data
                            company.questionsCount = lines.length - 1;
                            
                            // Parse each question and add to unique questions map
                            for (let j = 1; j < lines.length; j++) {
                                const line = lines[j];
                                const columns = this.parseCSVLine(line);
                                if (columns.length >= 4) {
                                    const questionId = parseInt(columns[0]);
                                    const title = columns[2]?.trim() || '';
                                    const difficulty = columns[3]?.trim() || '';
                                    const url = columns[1]?.trim() || '';
                                    
                                    // Add to unique questions map (overwrites if same ID exists)
                                    if (questionId && !isNaN(questionId)) {
                                        this.uniqueQuestions.set(questionId, {
                                            title,
                                            difficulty,
                                            url
                                        });
                                    }
                                    
                                    // Count for this company's breakdown
                                    const difficultyLower = difficulty.toLowerCase();
                                    if (difficultyLower === 'easy') company.easyCount++;
                                    else if (difficultyLower === 'medium') company.mediumCount++;
                                    else if (difficultyLower === 'hard') company.hardCount++;
                                }
                            }
                        }
                        company.loaded = true;
                    }
                } catch (error) {
                    console.log(`Could not load stats for ${company.name}:`, error);
                }
                
                loadedCount++;
                loadingCount.textContent = loadedCount;
                const progress = (loadedCount / this.companies.length) * 100;
                loadingProgress.style.width = `${progress}%`;
            }));
            
            // Small delay to allow UI updates
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        
        // Calculate total stats
        this.calculateTotalStats();
        
        // Debug log to verify unique counting
        console.log(`Loaded ${this.uniqueQuestions.size} unique questions from ${this.companies.filter(c => c.loaded).length} companies`);
        console.log('Difficulty breakdown:', {
            easy: this.totalStats.easyQuestions,
            medium: this.totalStats.mediumQuestions,
            hard: this.totalStats.hardQuestions
        });
        
        // Hide loading indicator
        loadingStats.style.display = 'none';
        
        // Update the display
        this.renderCompanies();
        this.updateStats();
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }

    calculateTotalStats() {
        // Calculate unique question stats from the map
        this.totalStats = {
            totalQuestions: this.uniqueQuestions.size,
            easyQuestions: 0,
            mediumQuestions: 0,
            hardQuestions: 0,
            avgQuestions: 0
        };
        
        // Count unique questions by difficulty
        for (const question of this.uniqueQuestions.values()) {
            const difficulty = question.difficulty.toLowerCase();
            if (difficulty === 'easy') {
                this.totalStats.easyQuestions++;
            } else if (difficulty === 'medium') {
                this.totalStats.mediumQuestions++;
            } else if (difficulty === 'hard') {
                this.totalStats.hardQuestions++;
            }
        }
        
        // Calculate average questions per company (based on total unique questions)
        const loadedCompanies = this.companies.filter(c => c.loaded);
        if (loadedCompanies.length > 0) {
            const totalCompanyQuestions = loadedCompanies.reduce((sum, company) => sum + company.questionsCount, 0);
            this.totalStats.avgQuestions = Math.round(totalCompanyQuestions / loadedCompanies.length);
        }
    }

    formatCompanyName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    setupEventListeners() {
        const searchInput = document.getElementById('searchInput');
        
        searchInput.addEventListener('input', (e) => {
            this.filterCompanies(e.target.value);
        });

        // Handle keyboard navigation
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const firstCompany = this.filteredCompanies[0];
                if (firstCompany) {
                    this.navigateToCompany(firstCompany.name);
                }
            }
        });
    }

    filterCompanies(searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term === '') {
            this.filteredCompanies = [...this.companies];
        } else {
            this.filteredCompanies = this.companies.filter(company => 
                company.name.toLowerCase().includes(term) ||
                company.displayName.toLowerCase().includes(term)
            );
        }
        
        this.renderCompanies();
        this.updateStats();
    }

    renderCompanies() {
        const grid = document.getElementById('companiesGrid');
        
        if (this.filteredCompanies.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <h3>No companies found</h3>
                    <p>Try adjusting your search terms</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.filteredCompanies.map(company => `
            <a href="company.html?company=${encodeURIComponent(company.name)}" class="company-card">
                <div class="company-name">${company.displayName}</div>
                <div class="company-stats">
                </div>
                ${company.loaded ? `
                    <div class="company-difficulty-breakdown">
                        <span class="difficulty-tag easy">${company.easyCount} Easy</span>
                        <span class="difficulty-tag medium">${company.mediumCount} Medium</span>
                        <span class="difficulty-tag hard">${company.hardCount} Hard</span>
                    </div>
                ` : ''}
            </a>
        `).join('');

        // Add click analytics (optional)
        this.addClickTracking();
    }

    addClickTracking() {
        const companyCards = document.querySelectorAll('.company-card');
        companyCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const companyName = card.querySelector('.company-name').textContent;
                console.log(`Navigating to: ${companyName}`);
            });
        });
    }

    navigateToCompany(companyName) {
        window.location.href = `company.html?company=${encodeURIComponent(companyName)}`;
    }

    updateStats() {
        document.getElementById('totalCompanies').textContent = this.companies.length;
        document.getElementById('filteredCompanies').textContent = this.filteredCompanies.length;
        
        // Update total stats
        document.getElementById('totalQuestions').textContent = this.totalStats.totalQuestions.toLocaleString();
        document.getElementById('avgQuestions').textContent = this.totalStats.avgQuestions;
        document.getElementById('easyQuestions').textContent = this.totalStats.easyQuestions.toLocaleString();
        document.getElementById('mediumQuestions').textContent = this.totalStats.mediumQuestions.toLocaleString();
        document.getElementById('hardQuestions').textContent = this.totalStats.hardQuestions.toLocaleString();
    }

    showError(message) {
        const grid = document.getElementById('companiesGrid');
        grid.innerHTML = `
            <div class="error">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add some visual enhancements
function addVisualEnhancements() {
    // Add loading animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .company-card {
            animation: fadeInUp 0.5s ease-out;
            animation-fill-mode: both;
        }
        
        .company-card:nth-child(1) { animation-delay: 0.1s; }
        .company-card:nth-child(2) { animation-delay: 0.2s; }
        .company-card:nth-child(3) { animation-delay: 0.3s; }
        .company-card:nth-child(4) { animation-delay: 0.4s; }
    `;
    document.head.appendChild(style);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CompanyDirectory();
    addVisualEnhancements();
    
    // Add some easter eggs
    console.log('🚀 LeetCode Company Directory loaded!');
    console.log('💡 Tip: Press Enter after typing in search to go to the first result');
});

// Service Worker registration for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}