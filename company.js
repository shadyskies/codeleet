class CompanyQuestions {
    constructor() {
        this.questions = [];
        this.filteredQuestions = [];
        this.currentSort = { field: 'id', order: 'asc' };
        this.companyName = '';
        this.solvedQuestions = new Set();
        this.init();
    }

    async init() {
        this.companyName = this.getCompanyFromURL();
        if (!this.companyName) {
            this.showError('No company specified in URL');
            return;
        }

        this.loadSolvedQuestions();
        this.updateCompanyHeader();
        await this.loadQuestions();
        this.setupEventListeners();
        this.renderQuestions();
        this.updateStats();
    }

    getCompanyFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('company');
    }

    loadSolvedQuestions() {
        const saved = localStorage.getItem(`solved_${this.companyName}`);
        if (saved) {
            this.solvedQuestions = new Set(JSON.parse(saved));
        }
    }

    saveSolvedQuestions() {
        localStorage.setItem(`solved_${this.companyName}`, JSON.stringify([...this.solvedQuestions]));
    }

    toggleSolved(questionId, isChecked) {
        if (isChecked) {
            this.solvedQuestions.add(questionId);
        } else {
            this.solvedQuestions.delete(questionId);
        }
        this.saveSolvedQuestions();
        this.updateQuestionDisplay(questionId, isChecked);
        this.updateStats();
    }

    updateQuestionDisplay(questionId, isSolved) {
        const row = document.querySelector(`tr[data-question-id="${questionId}"]`);
        if (row) {
            const titleCell = row.querySelector('.question-title');
            if (titleCell) {
                if (isSolved) {
                    titleCell.classList.add('question-solved');
                } else {
                    titleCell.classList.remove('question-solved');
                }
            }
        }
    }

    updateCompanyHeader() {
        const displayName = this.formatCompanyName(this.companyName);
        document.getElementById('companyName').textContent = displayName;
        document.title = `${displayName} - Interview Questions`;
    }

    formatCompanyName(name) {
        return name
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    async loadQuestions() {
        try {
            const response = await fetch(`data/${this.companyName}.csv`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            this.questions = this.parseCSV(csvText);
            this.filteredQuestions = [...this.questions];
            
            document.getElementById('loadingMessage').style.display = 'none';
            
        } catch (error) {
            console.error('Error loading questions:', error);
            this.showError(`Failed to load questions for ${this.formatCompanyName(this.companyName)}. Please check if the data file exists.`);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',');
        
        return lines.slice(1).map((line, index) => {
            const values = this.parseCSVLine(line);
            
            return {
                id: parseInt(values[0]) || index + 1,
                url: values[1] || '',
                title: values[2] || '',
                difficulty: values[3] || '',
                acceptance: parseFloat(values[4]?.replace('%', '')) || 0,
                frequency: parseFloat(values[5]?.replace('%', '')) || 0,
                acceptanceRaw: values[4] || '0%',
                frequencyRaw: values[5] || '0%'
            };
        }).filter(question => question.title); // Filter out empty rows
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        
        values.push(current.trim());
        return values;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('questionSearch');
        searchInput.addEventListener('input', debounce((e) => {
            this.filterQuestions();
        }, 300));

        // Difficulty filter
        const difficultyFilter = document.getElementById('difficultyFilter');
        difficultyFilter.addEventListener('change', () => {
            this.filterQuestions();
        });

        // Sort controls
        const sortSelect = document.getElementById('sortBy');
        const sortOrderBtn = document.getElementById('sortOrder');
        
        sortSelect.addEventListener('change', () => {
            this.currentSort.field = sortSelect.value;
            this.sortQuestions();
        });

        sortOrderBtn.addEventListener('click', () => {
            this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
            sortOrderBtn.textContent = this.currentSort.order === 'asc' ? '↑ ASC' : '↓ DESC';
            sortOrderBtn.setAttribute('data-order', this.currentSort.order);
            this.sortQuestions();
        });

        // Table header sorting
        const tableHeaders = document.querySelectorAll('th[data-sort]');
        tableHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const field = header.getAttribute('data-sort');
                
                if (this.currentSort.field === field) {
                    this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
                } else {
                    this.currentSort.field = field;
                    this.currentSort.order = 'asc';
                }
                
                // Update UI
                document.getElementById('sortBy').value = field;
                const sortOrderBtn = document.getElementById('sortOrder');
                sortOrderBtn.textContent = this.currentSort.order === 'asc' ? '↑ ASC' : '↓ DESC';
                sortOrderBtn.setAttribute('data-order', this.currentSort.order);
                
                this.updateSortIndicators();
                this.sortQuestions();
            });
        });
    }

    updateSortIndicators() {
        // Clear all indicators
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '';
            indicator.classList.remove('active');
        });

        // Set active indicator
        const activeHeader = document.querySelector(`th[data-sort="${this.currentSort.field}"] .sort-indicator`);
        if (activeHeader) {
            activeHeader.textContent = this.currentSort.order === 'asc' ? '↑' : '↓';
            activeHeader.classList.add('active');
        }
    }

    filterQuestions() {
        const searchTerm = document.getElementById('questionSearch').value.toLowerCase();
        const difficultyFilter = document.getElementById('difficultyFilter').value;

        this.filteredQuestions = this.questions.filter(question => {
            const matchesSearch = !searchTerm || 
                question.title.toLowerCase().includes(searchTerm) ||
                question.id.toString().includes(searchTerm);
            
            const matchesDifficulty = !difficultyFilter || 
                question.difficulty === difficultyFilter;

            return matchesSearch && matchesDifficulty;
        });

        this.sortQuestions();
    }

    sortQuestions() {
        this.filteredQuestions.sort((a, b) => {
            let aVal = a[this.currentSort.field];
            let bVal = b[this.currentSort.field];

            // Handle different data types
            if (this.currentSort.field === 'id' || this.currentSort.field === 'acceptance' || this.currentSort.field === 'frequency') {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            let comparison = 0;
            if (aVal > bVal) {
                comparison = 1;
            } else if (aVal < bVal) {
                comparison = -1;
            }

            return this.currentSort.order === 'desc' ? -comparison : comparison;
        });

        this.renderQuestions();
        this.updateStats();
    }

    renderQuestions() {
        const tbody = document.getElementById('questionsBody');
        
        if (this.filteredQuestions.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="no-results">
                        No questions found matching your criteria
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredQuestions.map(question => {
            const isSolved = this.solvedQuestions.has(question.id);
            return `
                <tr data-question-id="${question.id}">
                    <td class="solved-checkbox">
                        <input 
                            type="checkbox" 
                            id="solved_${question.id}"
                            ${isSolved ? 'checked' : ''}
                            onchange="window.companyQuestionsInstance.toggleSolved(${question.id}, this.checked)"
                        />
                    </td>
                    <td>${question.id}</td>
                    <td>
                        <a href="${question.url}" target="_blank" class="question-title ${isSolved ? 'question-solved' : ''}" rel="noopener noreferrer">
                            ${this.escapeHtml(question.title)}
                        </a>
                    </td>
                    <td class="difficulty-${question.difficulty.toLowerCase()}">
                        ${question.difficulty}
                    </td>
                    <td>${question.acceptanceRaw}</td>
                    <td>${question.frequencyRaw}</td>
                    <td>
                        <a href="${question.url}" target="_blank" class="leetcode-link" rel="noopener noreferrer">
                            View Problem
                        </a>
                    </td>
                </tr>
            `;
        }).join('');

        // Add row hover effects and analytics
        this.addRowInteractions();
    }

    addRowInteractions() {
        const rows = document.querySelectorAll('#questionsBody tr');
        rows.forEach(row => {
            row.addEventListener('click', (e) => {
                //redirect only on click of "View Problem" and the title
                if (e.target.classList.contains('question-title') || 
                    e.target.classList.contains('leetcode-link')) {
                    return;
                }
            });
        });
    }

    updateStats() {
        const total = this.questions.length;
        const filtered = this.filteredQuestions.length;
        const solved = this.questions.filter(q => this.solvedQuestions.has(q.id)).length;
        
        const easy = this.filteredQuestions.filter(q => q.difficulty === 'Easy').length;
        const medium = this.filteredQuestions.filter(q => q.difficulty === 'Medium').length;
        const hard = this.filteredQuestions.filter(q => q.difficulty === 'Hard').length;

        document.getElementById('totalQuestions').textContent = total;
        document.getElementById('filteredQuestions').textContent = filtered;
        document.getElementById('easyCount').textContent = easy;
        document.getElementById('mediumCount').textContent = medium;
        document.getElementById('hardCount').textContent = hard;

        // Update progress display
        this.updateProgressDisplay(solved, total);
    }

    updateProgressDisplay(solved, total) {
        // Create or update progress indicator in stats
        let progressCard = document.querySelector('.progress-card');
        if (!progressCard) {
            progressCard = document.createElement('div');
            progressCard.className = 'stat-card progress-card';
            document.querySelector('.stats').appendChild(progressCard);
        }
        
        const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;
        progressCard.innerHTML = `
            <h3>${solved}/${total}</h3>
            <p>Solved (${percentage}%)</p>
        `;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        document.getElementById('loadingMessage').style.display = 'none';
        document.getElementById('errorMessage').textContent = message;
        document.getElementById('errorMessage').style.display = 'block';
        
        // Hide table
        document.querySelector('.table-container').style.display = 'none';
        document.querySelector('.table-controls').style.display = 'none';
    }
}

// Utility function for debouncing
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

// Add keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + K to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            document.getElementById('questionSearch').focus();
        }
        
        // Escape to clear search
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('questionSearch');
            if (document.activeElement === searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
            }
        }
        
        // Ctrl/Cmd + A to toggle all checkboxes
        if ((e.ctrlKey || e.metaKey) && e.key === 'a' && e.shiftKey) {
            e.preventDefault();
            toggleAllSolved();
        }
    });
}

// Toggle all solved checkboxes
function toggleAllSolved() {
    const instance = window.companyQuestionsInstance;
    if (!instance) return;

    const checkboxes = document.querySelectorAll('.solved-checkbox input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
        const questionId = parseInt(checkbox.id.replace('solved_', ''));
        checkbox.checked = !allChecked;
        instance.toggleSolved(questionId, checkbox.checked);
    });
}

// Add bulk actions functionality
function addBulkActions() {
    const tableControls = document.querySelector('.table-controls');
    const bulkActions = document.createElement('div');
    bulkActions.className = 'bulk-actions';
    bulkActions.innerHTML = `
        <button class="sort-btn" onclick="toggleAllSolved()">
            Toggle All Solved
        </button>
        <button class="sort-btn" onclick="clearAllSolved()" style="background: var(--error);">
            Clear All Solved
        </button>
    `;
    tableControls.appendChild(bulkActions);
}

// Clear all solved questions
function clearAllSolved() {
    const instance = window.companyQuestionsInstance;
    if (!instance) return;

    if (confirm('Are you sure you want to clear all solved questions? This action cannot be undone.')) {
        instance.solvedQuestions.clear();
        instance.saveSolvedQuestions();
        instance.renderQuestions();
        instance.updateStats();
    }
}

// Add table export functionality with solved status
function addExportFunctionality() {
    const style = document.createElement('style');
    style.textContent = `
        .export-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 15px 20px;
            cursor: pointer;
            box-shadow: var(--shadow-lg);
            transition: var(--transition);
            z-index: 1000;
            font-size: 14px;
            font-weight: 500;
        }
        
        .export-btn:hover {
            background: #059669;
            transform: translateY(-2px);
        }
        
        .bulk-actions {
            display: flex;
            gap: 8px;
            align-items: center;
        }
        
        @media (max-width: 767px) {
            .bulk-actions {
                flex-direction: column;
                width: 100%;
            }
            
            .bulk-actions button {
                width: 100%;
            }
            
            .export-btn {
                bottom: 10px;
                right: 10px;
                padding: 12px 16px;
                font-size: 12px;
            }
        }
    `;
    document.head.appendChild(style);

}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.companyQuestionsInstance = new CompanyQuestions();
    setupKeyboardShortcuts();
    addExportFunctionality();
    addBulkActions();
    
    console.log('🎯 Company Questions page loaded!');
    console.log('💡 Keyboard shortcuts:');
    console.log('   Ctrl+K: Focus search');
    console.log('   Escape: Clear search');
    console.log('   Ctrl+Shift+A: Toggle all solved');
});