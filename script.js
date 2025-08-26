class CompanyDirectory {
    constructor() {
        this.companies = [];
        this.filteredCompanies = [];
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
                questionsCount: 0 // Will be loaded later if needed
            }));

            this.filteredCompanies = [...this.companies];
            
            // Optionally load question counts for each company
            await this.loadQuestionCounts();
            
        } catch (error) {
            console.error('Error loading companies:', error);
            this.showError('Failed to load companies. Please check if company_list.txt exists.');
        }
    }

    async loadQuestionCounts() {
        // Load question counts for a few companies to show stats
        const sampleCompanies = this.companies.slice(0, 10);
        
        for (const company of sampleCompanies) {
            try {
                const response = await fetch(company.csvFile);
                if (response.ok) {
                    const text = await response.text();
                    const lines = text.trim().split('\n');
                    company.questionsCount = Math.max(0, lines.length - 1); // Subtract header
                }
            } catch (error) {
                console.log(`Could not load questions count for ${company.name}`);
            }
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
                    <span>📄 ${company.questionsCount || 'N/A'} questions</span>
                    <span>🏢 ${company.name}</span>
                </div>
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