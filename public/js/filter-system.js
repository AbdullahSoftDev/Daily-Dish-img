class FilterSystem {
    constructor() {
        this.filters = {
            cookingTime: 'any',
            difficulty: 'any',
            dietary: 'any',
            cuisine: 'any',
            ingredients: []
        };
        this.activeFiltersCount = 0;
        this.loadSavedFilters();
    }

    // Show filter modal that matches your existing design
    showFilterModal() {
    const filterHtml = `
        <div class="modal fade" id="filterModal" tabindex="-1">
            <div class="modal-dialog modal-md">
                <div class="modal-content rounded-3 border-0 shadow-lg">
                    <div class="modal-header bg-primary text-white border-bottom-0 rounded-top-3">
                        <h5 class="modal-title fw-bold"><i class="fas fa-filter me-2"></i>Advanced Filters</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="row g-3">
                            <!-- Cooking Time -->
                            <div class="col-12">
                                <h6 class="mb-2 fw-semibold text-dark"><i class="fas fa-clock me-2 text-primary"></i>Cooking Time</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${this.createFilterButton('time', 'any', 'Any Time', this.filters.cookingTime === 'any')}
                                    ${this.createFilterButton('time', '30', '≤ 30 mins', this.filters.cookingTime === '30')}
                                    ${this.createFilterButton('time', '45', '≤ 45 mins', this.filters.cookingTime === '45')}
                                    ${this.createFilterButton('time', '60', '≤ 1 hour', this.filters.cookingTime === '60')}
                                    ${this.createFilterButton('time', '120', '≤ 2 hours', this.filters.cookingTime === '120')}
                                </div>
                            </div>

                            <!-- Dietary Preference -->
                            <div class="col-12">
                                <h6 class="mb-2 fw-semibold text-dark"><i class="fas fa-utensils me-2 text-success"></i>Dietary Preference</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${this.createFilterButton('diet', 'any', 'All Dishes', this.filters.dietary === 'any')}
                                    ${this.createFilterButton('diet', 'veg', 'Vegetarian', this.filters.dietary === 'veg')}
                                    ${this.createFilterButton('diet', 'non-veg', 'Non-Vegetarian', this.filters.dietary === 'non-veg')}
                                    ${this.createFilterButton('diet', 'sea-food', 'Sea-Food', this.filters.dietary === 'sea-food')}
                                </div>
                            </div>

                            <!-- Cuisine Type -->
                            <div class="col-12">
                                <h6 class="mb-2 fw-semibold text-dark"><i class="fas fa-globe me-2 text-info"></i>Cuisine Type</h6>
                                <div class="d-flex flex-wrap gap-2">
                                    ${this.createFilterButton('cuisine', 'any', 'Any Cuisine', this.filters.cuisine === 'any')}
                                    ${this.createFilterButton('cuisine', 'pakistani', 'Pakistani', this.filters.cuisine === 'pakistani')}
                                    ${this.createFilterButton('cuisine', 'indian', 'Indian', this.filters.cuisine === 'indian')}
                                    ${this.createFilterButton('cuisine', 'italian', 'Italian', this.filters.cuisine === 'italian')}
                                    ${this.createFilterButton('cuisine', 'chinese', 'Chinese', this.filters.cuisine === 'chinese')}
                                    ${this.createFilterButton('cuisine', 'mexican', 'Mexican', this.filters.cuisine === 'mexican')}
                                </div>
                            </div>

                            <!-- Ingredients Search -->
                            <div class="col-12">
                                <h6 class="mb-2 fw-semibold text-dark"><i class="fas fa-search me-2 text-warning"></i>Ingredients Search</h6>
                                <div class="input-group input-group-sm">
                                    <input type="text" class="form-control rounded-2" id="ingredientInput" 
                                           placeholder="Type ingredient (e.g., chicken, tomato)...">
                                    <button class="btn btn-primary rounded-2" type="button" onclick="filterSystem.addIngredient()">
                                        <i class="fas fa-plus"></i>
                                    </button>
                                </div>
                                <div id="selectedIngredients" class="d-flex flex-wrap gap-1 mt-2">
                                    ${this.filters.ingredients.map(ing => `
                                        <span class="badge bg-primary d-flex align-items-center px-2 py-1 rounded-2">
                                            ${ing}
                                            <button type="button" class="btn-close btn-close-white ms-1" style="font-size: 0.7rem;" onclick="filterSystem.removeIngredient('${ing}')"></button>
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-top-0 rounded-bottom-3">
                        <button type="button" class="btn btn-outline-secondary rounded-2 px-3" onclick="filterSystem.clearFilters()">
                            <i class="fas fa-times me-1"></i> Clear All
                        </button>
                        <button type="button" class="btn btn-primary rounded-2 px-4" onclick="filterSystem.applyFilters()">
                            <i class="fas fa-check me-1"></i> Apply Filters
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('filterModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', filterHtml);
    this.attachFilterEvents();

    const modal = new bootstrap.Modal(document.getElementById('filterModal'));
    modal.show();
}

// New method for creating filter buttons
createFilterButton(type, value, label, isActive) {
    const activeClass = isActive ? 'active' : '';
    return `
        <button type="button" class="btn btn-sm filter-btn ${type}-filter ${activeClass}" 
                data-${type}="${value}">
            ${label}
        </button>
    `;
}

    // In the createFilterTab method, update the HTML:
createFilterTab(type, value, label, isActive) {
    const activeClass = isActive ? 'active' : '';
    return `
        <li class="nav-item">
            <a class="nav-link border border-secondary rounded-pill me-2 filter-tab ${type}-filter ${activeClass} custom-filter-btn" 
               data-${type}="${value}">
                ${label}
            </a>
        </li>
    `;
}

    attachFilterEvents() {
    // Time filter buttons
    document.querySelectorAll('.time-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.time-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.filters.cookingTime = e.currentTarget.dataset.time;
        });
    });

    // Dietary filter buttons
    document.querySelectorAll('.diet-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.diet-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.filters.dietary = e.currentTarget.dataset.diet;
        });
    });

    // Cuisine filter buttons
    document.querySelectorAll('.cuisine-filter').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('.cuisine-filter').forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            this.filters.cuisine = e.currentTarget.dataset.cuisine;
        });
    });

    // Enter key for ingredient input
    const ingredientInput = document.getElementById('ingredientInput');
    if (ingredientInput) {
        ingredientInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addIngredient();
                e.preventDefault();
            }
        });
    }
}

    addIngredient() {
        const input = document.getElementById('ingredientInput');
        if (!input) return;
        
        const ingredient = input.value.trim().toLowerCase();
        
        if (ingredient && !this.filters.ingredients.includes(ingredient)) {
            this.filters.ingredients.push(ingredient);
            this.updateSelectedIngredientsDisplay();
            input.value = '';
            input.focus();
        }
    }

    removeIngredient(ingredient) {
        this.filters.ingredients = this.filters.ingredients.filter(ing => ing !== ingredient);
        this.updateSelectedIngredientsDisplay();
    }

    updateSelectedIngredientsDisplay() {
        const container = document.getElementById('selectedIngredients');
        if (container) {
            container.innerHTML = this.filters.ingredients.map(ing => `
                <span class="badge bg-primary d-flex align-items-center px-3 py-2">
                    ${ing}
                    <button type="button" class="btn-close btn-close-white ms-2" onclick="filterSystem.removeIngredient('${ing}')"></button>
                </span>
            `).join('');
        }
    }

    applyFilters() {
    // Save filters to localStorage
    localStorage.setItem('dishFilters', JSON.stringify(this.filters));
    
    // Update active filters count
    this.activeFiltersCount = this.getActiveFiltersCount();
    
    // Enhanced filter data with proper cuisine and ingredients
    const filterData = {
        cookingTime: this.filters.cookingTime,
        dietary: this.filters.dietary,
        cuisine: this.filters.cuisine,
        ingredients: this.filters.ingredients,
        difficulty: this.filters.difficulty
    };
    
    // Dispatch event for shop filter system to listen to
    const filterEvent = new CustomEvent('filtersChanged', { 
        detail: filterData 
    });
    document.dispatchEvent(filterEvent);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
    if (modal) {
        modal.hide();
    }
    
    // Show notification
    this.showFilterNotification();
}

    clearFilters() {
        this.filters = {
            cookingTime: 'any',
            difficulty: 'any',
            dietary: 'any',
            cuisine: 'any',
            ingredients: []
        };
        
        // Reset button states in modal
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Activate "any" buttons
        document.querySelector('[data-time="any"]')?.classList.add('active');
        document.querySelector('[data-diff="any"]')?.classList.add('active');
        document.querySelector('[data-diet="any"]')?.classList.add('active');
        document.querySelector('[data-cuisine="any"]')?.classList.add('active');
        
        this.updateSelectedIngredientsDisplay();
        localStorage.removeItem('dishFilters');
        this.activeFiltersCount = 0;
        this.applyFiltersToCurrentView();
        
        // Close modal if open
        const modal = bootstrap.Modal.getInstance(document.getElementById('filterModal'));
        if (modal) {
            modal.hide();
        }
    }

    getActiveFiltersCount() {
        let count = 0;
        if (this.filters.cookingTime !== 'any') count++;
        if (this.filters.difficulty !== 'any') count++;
        if (this.filters.dietary !== 'any') count++;
        if (this.filters.cuisine !== 'any') count++;
        if (this.filters.ingredients.length > 0) count++;
        return count;
    }

    applyFiltersToCurrentView() {
        // This will filter the currently displayed dishes
        this.showFilterIndicator();
        
        // If dishManager exists, apply filters to search
        if (window.dishManager && typeof window.dishManager.searchDishes === 'function') {
            console.log('Applying filters:', this.filters);
            // You can implement the actual filtering logic here
        }
    }

    showFilterIndicator() {
        let indicator = document.getElementById('filterIndicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'filterIndicator';
            indicator.className = 'container-fluid py-3 bg-light border-bottom';
            // Insert at the top of the main content
            const mainContent = document.querySelector('.container-fluid.fruite') || document.querySelector('main');
            if (mainContent) {
                mainContent.insertAdjacentElement('beforebegin', indicator);
            }
        }

        const activeCount = this.activeFiltersCount;
        if (activeCount > 0) {
            indicator.innerHTML = `
                <div class="container">
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-filter text-primary me-2 fs-5"></i>
                            <div>
                                <strong class="text-dark">${activeCount} active filter(s) applied</strong>
                                <small class="text-muted d-block">Click modify to change filters</small>
                            </div>
                        </div>
                        <div>
                            <button class="btn btn-sm btn-outline-primary me-2 custom-btn" onclick="filterSystem.showFilterModal()">
                                <i class="fas fa-edit me-1"></i> Modify
                            </button>
                            <button class="btn btn-sm btn-outline-danger custom-btn" onclick="filterSystem.clearFilters()">
                                <i class="fas fa-times me-1"></i> Clear All
                            </button>
                        </div>
                    </div>
                </div>
            `;
            indicator.style.display = 'block';
        } else {
            indicator.style.display = 'none';
        }
    }

    showFilterNotification() {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success position-fixed top-0 start-50 translate-middle-x mt-3 shadow';
        notification.style.zIndex = '1060';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>Filters applied!</strong> Showing ${this.activeFiltersCount} active filter(s).
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 3000);
    }

    // Load saved filters
    loadSavedFilters() {
        const saved = localStorage.getItem('dishFilters');
        if (saved) {
            try {
                this.filters = { ...this.filters, ...JSON.parse(saved) };
                this.activeFiltersCount = this.getActiveFiltersCount();
                this.showFilterIndicator();
            } catch (e) {
                console.error('Error loading saved filters:', e);
            }
        }
    }
}

// Initialize the filter system
window.filterSystem = new FilterSystem();