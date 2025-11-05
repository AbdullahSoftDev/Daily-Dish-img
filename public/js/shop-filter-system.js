// shop-filter-system.js - COMPLETE AND WORKING
class ShopFilterSystem {
    constructor() {
        this.currentFilters = {
            category: 'all',
            type: 'all',
            search: '',
            cookingTime: 'any',
            region: 'all',
            difficulty: 'any',
            dietary: 'any',
            cuisine: 'any'
        };
        this.allDishes = [];
        this.filteredDishes = [];
        this.currentPage = 1;
        this.dishesPerPage = 9;
        this.isLoading = false;
        this.init();
    }

    async init() {
        console.log('🔄 Initializing Enhanced Shop Filter System...');
        await this.loadDishes();
        this.initEventListeners();
        this.initRegionSelection();
        this.initShoppingBag();
        this.loadFeaturedRecipes();
        this.applyFilters();
        this.handleURLParameters(); // ADD THIS LINE
        console.log('✅ Enhanced Shop Filter System Ready!');
    }

    async loadDishes() {
        this.showLoadingState();
        
        try {
            console.log('📁 Loading dishes for shop...');
            
            // Wait for dishManager
            if (!window.dishManager) {
                await new Promise(resolve => {
                    const checkManager = setInterval(() => {
                        if (window.dishManager) {
                            clearInterval(checkManager);
                            resolve();
                        }
                    }, 100);
                });
            }
            
            // Load dishes if needed
            if (!window.dishManager.isLoaded) {
                await window.dishManager.loadDishes();
            }
            
            this.loadFromDishManager();
            
        } catch (error) {
            console.error('❌ Failed to load dishes:', error);
            this.loadSampleDishes();
        }
    }

    loadFromDishManager() {
        this.allDishes = [];
        
        if (window.dishManager && window.dishManager.isLoaded) {
            this.allDishes = window.dishManager.getAllDishes();
            
            console.log(`✅ Loaded ${this.allDishes.length} dishes from DishManager`);
            this.hideLoadingState();
            this.updateCategoryCounts();
        } else {
            console.error('❌ dishManager data not available');
            this.loadSampleDishes();
        }
    }

    loadSampleDishes() {
        // Sample dishes as fallback
        this.allDishes = [
            {
                id: 1001, name: "Chicken Karahi", category: "Chicken Dishes", type: "non-veg",
                ingredients: ["Chicken", "Tomatoes", "Ginger-Garlic Paste", "Yogurt", "Green Chilies"],
                cookTime: "30-40 mins", image: "img/chicken-karahi.webp", difficulty: "Medium", cuisine: "Pakistani"
            },
            {
                id: 1002, name: "Vegetable Pulao", category: "Rice Dishes", type: "veg",
                ingredients: ["Rice", "Mixed Vegetables", "Spices", "Oil"],
                cookTime: "35-45 mins", image: "img/vegetable-pulao.webp", difficulty: "Easy", cuisine: "Pakistani"
            }
        ];
        
        console.log(`✅ Loaded ${this.allDishes.length} sample dishes`);
        this.hideLoadingState();
        this.updateCategoryCounts();
    }

    initEventListeners() {
        console.log('🔗 Initializing event listeners...');
        
        // Category filter pills
        document.querySelectorAll('.fruite-categorie a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = this.getCategoryFromText(link.textContent);
                this.setCategoryFilter(category);
            });
        });

        // Dropdown filter
        const dropdown = document.getElementById('categoryFilter');
        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                this.setTypeFilter(e.target.value);
            });
        }

        // Search functionality
        const searchInput = document.getElementById('shopSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.setSearchFilter(e.target.value);
            });

            const searchIcon = document.querySelector('#search-icon-1');
            if (searchIcon) {
                searchIcon.addEventListener('click', () => {
                    this.setSearchFilter(searchInput.value);
                });
            }
        }

        // Enter key in search
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const searchInput = document.getElementById('shopSearch');
                if (searchInput && document.activeElement === searchInput) {
                    this.setSearchFilter(searchInput.value);
                }
            }
        });

        // Advanced filters integration
        if (window.filterSystem) {
            this.integrateAdvancedFilters();
        }

        console.log('✅ Event listeners initialized');
    }

    integrateAdvancedFilters() {
        // Listen for filter changes from the advanced filter system
        document.addEventListener('filtersChanged', (e) => {
            if (e.detail) {
                this.currentFilters = { 
                    ...this.currentFilters, 
                    cookingTime: e.detail.cookingTime || 'any',
                    dietary: e.detail.dietary || 'any',
                    cuisine: e.detail.cuisine || 'any',
                    ingredients: e.detail.ingredients || [],
                    difficulty: e.detail.difficulty || 'any'
                };
                this.applyFilters();
            }
        });
    }

    // Quick Filter Functions
    setCookingTimeFilter(time) {
        this.currentFilters.cookingTime = time;
        this.applyFilters();
        this.showNotification(`⏱️ Showing meals under ${time} minutes`, 'info');
    }

    setDifficultyFilter(difficulty) {
        this.currentFilters.difficulty = difficulty;
        this.applyFilters();
        this.showNotification(`🎯 Showing ${difficulty} recipes`, 'info');
    }

    setCategoryFilter(category) {
        this.currentFilters.category = category;
        this.updateActiveCategory(category);
        this.applyFilters();
        this.showNotification(`🍽️ Showing ${category} dishes`, 'info');
    }

    setTypeFilter(type) {
        this.currentFilters.type = type;
        this.applyFilters();
        const categoryName = type === 'all' ? 'All Categories' : type;
        this.showNotification(`📁 Showing ${categoryName}`, 'info');
    }

    setSearchFilter(searchTerm) {
        this.currentFilters.search = searchTerm.toLowerCase().trim();
        this.applyFilters();
        if (searchTerm) {
            this.showNotification(`🔍 Searching for "${searchTerm}"`, 'info');
        }
    }

    updateActiveCategory(activeCategory) {
        document.querySelectorAll('.fruite-categorie li').forEach(li => {
            li.classList.remove('active');
        });

        document.querySelectorAll('.fruite-categorie a').forEach(link => {
            if (this.getCategoryFromText(link.textContent) === activeCategory) {
                link.closest('li').classList.add('active');
            }
        });
    }

    getCategoryFromText(text) {
        const textLower = text.toLowerCase().trim();
        if (textLower.includes('all')) return 'all';
        if (textLower.includes('non-veg')) return 'non-veg';
        if (textLower.includes('veg') && !textLower.includes('sea')) return 'veg';
        if (textLower.includes('sea-food')) return 'sea-food';
        if (textLower.includes('fast food')) return 'fast-food';
        return 'all';
    }

    loadFeaturedRecipes() {
        const featuredContainer = document.getElementById('featuredRecipes');
        if (!featuredContainer || this.allDishes.length === 0) return;

        // Get 2 random dishes
        const featuredDishes = window.dishManager.getRandomDishes(2);

        featuredContainer.innerHTML = featuredDishes.map(dish => `
            <div class="d-flex align-items-center justify-content-start mb-3 featured-recipe-item">
                <div class="rounded me-3">
                    <img src="${dish.image || 'img/fruite-item-5.webp'}" 
                         class="featured-recipe-img" 
                         alt="${dish.name}" 
                         onerror="this.src='img/fruite-item-5.webp'">
                </div>
                <div>
                    <h6 class="mb-1">${dish.name}</h6>
                    <div class="d-flex mb-1">
                        ${this.generateStarRating(4 + Math.random())}
                    </div>
                    <small class="text-muted">⏱️ ${dish.cookTime || '30-40 mins'}</small>
                </div>
            </div>
        `).join('');
    }

    generateStarRating(average) {
        const stars = [];
        const fullStars = Math.floor(average);
        const hasHalfStar = average % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars.push('<i class="fas fa-star text-warning small"></i>');
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars.push('<i class="fas fa-star-half-alt text-warning small"></i>');
            } else {
                stars.push('<i class="far fa-star text-warning small"></i>');
            }
        }
        
        return stars.join('');
    }

    applyFilters() {
    if (this.isLoading) return;
    
    console.log('🔄 Applying filters with RANDOMIZATION:', this.currentFilters);
    
    // Filter dishes based on current filters
    let filtered = this.allDishes.filter(dish => {
        // Category filter (type-based for sidebar pills)
        if (this.currentFilters.category !== 'all') {
            if (this.currentFilters.category === 'sea-food') {
                if (!dish.type || (dish.type !== 'sea-food' && dish.category !== 'Seafood Dishes')) {
                    return false;
                }
            } else if (this.currentFilters.category === 'fast-food') {
                if (!dish.category || !dish.category.toLowerCase().includes('fast food')) {
                    return false;
                }
            } else if (!dish.type || dish.type !== this.currentFilters.category) {
                return false;
            }
        }

        // Type filter (category-based from dropdown)
        if (this.currentFilters.type !== 'all') {
            if (this.currentFilters.type === 'Breakfast (Nashta)') {
                if (!dish.category || !dish.category.includes('Breakfast')) {
                    return false;
                }
            } else if (this.currentFilters.type === 'Vegetable Dishes') {
                if (!dish.category || !dish.category.includes('Vegetable')) {
                    return false;
                }
            } else if (!dish.category || dish.category !== this.currentFilters.type) {
                return false;
            }
        }

        // Search filter
        if (this.currentFilters.search) {
            const nameMatch = dish.name && dish.name.toLowerCase().includes(this.currentFilters.search);
            const ingredientMatch = dish.ingredients && 
                dish.ingredients.some(ing => ing.toLowerCase().includes(this.currentFilters.search));
            const categoryMatch = dish.category && dish.category.toLowerCase().includes(this.currentFilters.search);
            
            if (!nameMatch && !ingredientMatch && !categoryMatch) {
                return false;
            }
        }

        // Advanced filters
        if (this.currentFilters.cookingTime !== 'any') {
            const cookTime = this.parseCookTime(dish.cookTime);
            if (cookTime > parseInt(this.currentFilters.cookingTime)) {
                return false;
            }
        }

        // Easy recipes filter (cooking time < 30 minutes)
        if (this.currentFilters.difficulty === 'easy') {
            const cookTime = this.parseCookTime(dish.cookTime);
            if (cookTime > 30) {
                return false;
            }
        }

        // Dietary filter
        if (this.currentFilters.dietary !== 'any') {
            if (this.currentFilters.dietary === 'veg' && dish.type !== 'veg') {
                return false;
            }
            if (this.currentFilters.dietary === 'non-veg' && dish.type !== 'non-veg') {
                return false;
            }
            if (this.currentFilters.dietary === 'sea-food' && dish.type !== 'sea-food') {
                return false;
            }
        }

        // Cuisine Type filter
        if (this.currentFilters.cuisine !== 'any') {
            if (!dish.cuisine || dish.cuisine.toLowerCase() !== this.currentFilters.cuisine.toLowerCase()) {
                return false;
            }
        }

        return true;
    });

    // APPLY RANDOMIZATION - Fisher-Yates shuffle for efficient randomization
    this.filteredDishes = this.shuffleArray([...filtered]);
    
    console.log(`📊 Filtered to ${this.filteredDishes.length} dishes (RANDOMIZED)`);
    this.currentPage = 1;
    this.displayDishes();
    this.updateCategoryCounts();
    this.updateResultsCounter();
}

// Efficient Fisher-Yates shuffle algorithm for randomization
shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

    parseCookTime(cookTime) {
        if (!cookTime) return 0;
        const timeMatch = cookTime.match(/(\d+)/g);
        if (timeMatch && timeMatch.length > 0) {
            const times = timeMatch.map(Number);
            return times.reduce((a, b) => a + b, 0) / times.length;
        }
        return 0;
    }

    displayDishes() {
        const dishesContainer = document.getElementById('dishesContainer');
        if (!dishesContainer) {
            console.error('❌ Dishes container not found');
            return;
        }

        const startIndex = (this.currentPage - 1) * this.dishesPerPage;
        const endIndex = startIndex + this.dishesPerPage;
        const currentDishes = this.filteredDishes.slice(startIndex, endIndex);

        if (currentDishes.length === 0) {
            dishesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">No recipes found</h4>
                    <p class="text-muted">Try adjusting your filters or search terms</p>
                    <button class="btn btn-primary mt-3" onclick="shopFilterSystem.resetFilters()">
                        <i class="fas fa-refresh me-2"></i> Reset All Filters
                    </button>
                </div>
            `;
        } else {
            dishesContainer.innerHTML = currentDishes.map(dish => this.createDishCard(dish)).join('');
        }
        
        this.updatePagination();
    }

    createDishCard(dish) {
    const defaultImage = 'img/fruite-item-5.webp';
    const imageUrl = dish.image || defaultImage;
    const isFavorite = window.userManager ? window.userManager.isFavorite(dish) : false;
    const rating = window.userManager ? window.userManager.getDishRating(dish) : { average: 0, count: 0 };

    // Truncate description to ensure consistent height
    const description = this.getDishDescription(dish);
    const truncatedDescription = description.length > 100 ? description.substring(0, 100) + '...' : description;

    return `
        <div class="col-md-6 col-lg-6 col-xl-4 mb-4">
            <div class="rounded position-relative fruite-item h-100">
                <div class="fruite-img">
                    <img src="${imageUrl}" class="img-fluid w-100 rounded-top" alt="${dish.name}" loading="lazy"  <!-- ADD THIS -->
                         onerror="this.src='${defaultImage}'" style="height: 200px; object-fit: cover;">
                </div>
                <div class="text-white bg-secondary px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">
                    ${this.getTypeBadge(dish.type)}
                </div>
                <div class="position-absolute" style="top: 10px; right: 10px;">
                    <button class="btn btn-sm ${isFavorite ? 'btn-danger' : 'btn-outline-danger'}" 
                            onclick="shopFilterSystem.toggleFavorite(${dish.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="p-4 border border-secondary border-top-0 rounded-bottom d-flex flex-column h-100">
                    <h5 class="mb-2">
                        <a href="shop-detail.html?recipe=${encodeURIComponent(dish.name)}&id=${dish.id}" 
                           class="text-dark text-decoration-none stretched-link">
                            ${dish.name}
                        </a>
                    </h5>
                    <p class="text-muted mb-3 flex-grow-1" style="min-height: 60px;">${truncatedDescription}</p>
                    
                    ${rating.count > 0 ? `
                        <div class="mb-3">
                            <div class="d-flex align-items-center">
                                ${this.generateStarRating(rating.average)}
                                <small class="text-muted ms-2">(${rating.count})</small>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                        <span class="text-dark fw-bold">⏱️ ${dish.cookTime || '30-40 mins'}</span>
                        <div class="d-flex gap-2">
                            <button class="btn border border-secondary rounded-pill px-3 text-primary btn-sm btn-shopping-bag"
                                   onclick="shopFilterSystem.addToShoppingList(${dish.id})">
                                <i class="fa fa-shopping-bag me-1"></i> Add
                            </button>
                            <button class="btn border border-secondary rounded-pill px-3 text-primary btn-sm btn-share"
                                   onclick="shopFilterSystem.shareRecipe(${dish.id})">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

    getTypeBadge(type) {
        const typeMap = {
            'non-veg': '🍗 Non-Veg',
            'veg': '🥬 Veg', 
            'sea-food': '🐟 Sea Food',
            'fast-food': '🍔 Fast Food'
        };
        return typeMap[type] || '🍽️ Dish';
    }

    getDishDescription(dish) {
        if (dish.ingredients && dish.ingredients.length > 0) {
            const ingredients = dish.ingredients.slice(0, 3).join(', ');
            return `Ingredients: ${ingredients}${dish.ingredients.length > 3 ? '...' : ''}`;
        }
        return 'A delicious dish that will satisfy your cravings. Perfect for any occasion.';
    }

    updateCategoryCounts() {
        if (this.allDishes.length === 0) return;

        const categories = {
            'all': this.allDishes.length,
            'non-veg': this.allDishes.filter(d => d.type === 'non-veg').length,
            'veg': this.allDishes.filter(d => d.type === 'veg').length,
            'sea-food': this.allDishes.filter(d => d.type === 'sea-food' || d.category === 'Seafood Dishes').length,
            'fast-food': this.allDishes.filter(d => d.category && d.category.toLowerCase().includes('fast food')).length
        };

        document.querySelectorAll('.fruite-categorie span').forEach(span => {
            const li = span.closest('li');
            const link = li.querySelector('a');
            const category = this.getCategoryFromText(link.textContent);
            span.textContent = `(${categories[category]})`;
        });
    }

    updateResultsCounter() {
        const totalDishes = this.filteredDishes.length;
        const startIndex = (this.currentPage - 1) * this.dishesPerPage + 1;
        const endIndex = Math.min(startIndex + this.dishesPerPage - 1, totalDishes);
        const totalPages = Math.ceil(totalDishes / this.dishesPerPage);

        let counter = document.getElementById('resultsCounter');
        if (!counter) {
            counter = document.createElement('div');
            counter.id = 'resultsCounter';
            counter.className = 'results-counter mb-3';
            const dishesContainer = document.querySelector('.col-lg-9');
            if (dishesContainer) {
                dishesContainer.insertBefore(counter, dishesContainer.firstChild);
            }
        }

        counter.innerHTML = `
            <div class="alert alert-light border">
                <strong>Showing ${startIndex}-${endIndex} of ${totalDishes} recipes</strong>
                <small class="text-muted">(Page ${this.currentPage} of ${totalPages})</small>
                ${this.currentFilters.search ? `<br><small class="text-primary">Search: "${this.currentFilters.search}"</small>` : ''}
            </div>
        `;
    }

    updatePagination() {
        const paginationContainer = document.querySelector('.pagination');
        if (!paginationContainer) return;

        const totalPages = Math.ceil(this.filteredDishes.length / this.dishesPerPage);
        
        if (totalPages <= 1) {
            paginationContainer.style.display = 'none';
            return;
        }

        paginationContainer.style.display = 'flex';
        
        // Always show exactly 6 pages like in your template
        const maxVisiblePages = 6;
        let startPage, endPage;
        
        if (totalPages <= maxVisiblePages) {
            // Show all pages
            startPage = 1;
            endPage = totalPages;
        } else {
            // Show fixed 6 pages, centered around current page
            startPage = Math.max(1, this.currentPage - 2);
            endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
            
            // Adjust if we're at the end
            if (endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }
        }

        let paginationHTML = '';
        
        // Previous button
        if (this.currentPage > 1) {
            paginationHTML += `<a href="#" class="rounded" onclick="shopFilterSystem.changePage(${this.currentPage - 1}); return false;">&laquo;</a>`;
        } else {
            paginationHTML += `<a href="#" class="rounded disabled">&laquo;</a>`;
        }

        // Page numbers - always show exactly 6 pages
        for (let i = startPage; i <= endPage; i++) {
            if (i === this.currentPage) {
                paginationHTML += `<a href="#" class="active rounded">${i}</a>`;
            } else {
                paginationHTML += `<a href="#" class="rounded" onclick="shopFilterSystem.changePage(${i}); return false;">${i}</a>`;
            }
        }

        // Next button
        if (this.currentPage < totalPages) {
            paginationHTML += `<a href="#" class="rounded" onclick="shopFilterSystem.changePage(${this.currentPage + 1}); return false;">&raquo;</a>`;
        } else {
            paginationHTML += `<a href="#" class="rounded disabled">&raquo;</a>`;
        }

        paginationContainer.innerHTML = paginationHTML;
    }

    changePage(page) {
        this.currentPage = page;
        this.displayDishes();
        this.updateResultsCounter();
        this.updatePagination();
        this.scrollToDishesSection();
    }

    scrollToDishesSection() {
        // For mobile, scroll to the dishes container
        if (window.innerWidth < 768) {
            const dishesContainer = document.getElementById('dishesContainer');
            if (dishesContainer) {
                const offset = 80;
                const elementPosition = dishesContainer.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        } else {
            // For desktop, scroll to "Discover Amazing Recipes" heading
            const heading = document.querySelector('h1.mb-4');
            if (heading) {
                const offset = 100;
                const elementPosition = heading.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
    }

    setEasyRecipesFilter() {
        this.currentFilters.difficulty = 'easy';
        this.applyFilters();
        this.showNotification(`⭐ Showing easy recipes (<30 mins)`, 'info');
    }

    // User Interaction Methods
    // FIXED: Favorite Button - No DOM removal
toggleFavorite(dishId) {
    console.log('❤️ TOGGLE FAVORITE CALLED:', dishId);
    
    // DIRECTLY call UserManager - don't use any local notification system
    if (!window.userManager) {
        console.error('❌ UserManager not found');
        return false;
    }

    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish) {
        console.error('❌ Dish not found for favorite:', dishId);
        return false;
    }

    // Let UserManager handle everything - login check, notifications, etc.
    const result = window.userManager.toggleFavorite(dish);
    
    // Update ONLY the heart icon visual state
    const heartButton = document.querySelector(`[data-dish-id="${dishId}"] .btn-outline-danger, [data-dish-id="${dishId}"] .btn-danger`);
    if (heartButton && result !== false) { // Only update if not cancelled by login
        if (result === true) {
            heartButton.classList.remove('btn-outline-danger');
            heartButton.classList.add('btn-danger');
        } else {
            heartButton.classList.remove('btn-danger');
            heartButton.classList.add('btn-outline-danger');
        }
        
        // Add animation
        heartButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
        }, 300);
    }
    
    return false;
}
// FIXED: Add to Shopping List with proper login check
addToShoppingList(dishId) {
    console.log('🛒 ADD TO SHOPPING LIST CALLED:', dishId);
    
    // Check if user is logged in FIRST
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        
        setTimeout(() => {
            if (window.userManager) {
                window.userManager.showLoginModal();
            }
        }, 500);
        
        return false;
    }

    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish) {
        console.error('❌ Dish not found:', dishId);
        return false;
    }

    // Show immediate visual feedback
    const button = document.querySelector(`[data-dish-id="${dishId}"] .btn-shopping-bag`);
    if (button) {
        const originalHTML = button.innerHTML;
        const originalClasses = button.className;
        
        button.innerHTML = '<i class="fas fa-check me-1"></i> Added';
        button.className = 'btn btn-success rounded-pill px-3 text-white btn-sm';
        button.disabled = true;

        // Add to shopping list via UserManager
        if (window.userManager) {
            console.log('🛒 Calling UserManager.addToShoppingList');
            const success = window.userManager.addToShoppingList(dish);
            console.log('🛒 Add to shopping list result:', success);
            
            if (!success) {
                // If failed, reset button immediately
                button.innerHTML = originalHTML;
                button.className = originalClasses;
                button.disabled = false;
                return false;
            }
        }
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.className = originalClasses;
            button.disabled = false;
        }, 2000);
    }
    
    return false;
}



    // FIXED: Share Button Functionality
shareRecipe(dishId) {
    console.log('📤 SHARE RECIPE CALLED:', dishId);
    
    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish) {
        console.error('❌ Dish not found for sharing:', dishId);
        // Try to find by index
        const dishIndex = dishId - 1000;
        if (this.allDishes[dishIndex]) {
            dish = this.allDishes[dishIndex];
        } else {
            this.showNotification('❌ Could not share recipe', 'error');
            return false;
        }
    }

    console.log('📤 Sharing recipe:', dish.name);
    
    // Create proper shareable URL
    const recipeUrl = `${window.location.origin}/shop-detail.html?recipe=${encodeURIComponent(dish.name)}&id=${dish.id}`;
    const shareText = `Check out this amazing recipe: ${dish.name} - ${recipeUrl}`;
    
    // Show share options modal
    this.showShareModal(dish, recipeUrl, shareText);
    
    return false;
}

// NEW: Show share options modal
showShareModal(dish, recipeUrl, shareText) {
    const modalHtml = `
        <div class="modal fade" id="shareModal" tabindex="-1">
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Share "${dish.name}"</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="row g-3">
                            <div class="col-6">
                                <button class="btn btn-outline-primary w-100 p-3" onclick="shopFilterSystem.shareOnPlatform('facebook', '${dish.name}', '${recipeUrl}')">
                                    <i class="fab fa-facebook fa-2x"></i>
                                    <div class="small mt-1">Facebook</div>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-info w-100 p-3" onclick="shopFilterSystem.shareOnPlatform('twitter', '${dish.name}', '${recipeUrl}')">
                                    <i class="fab fa-twitter fa-2x"></i>
                                    <div class="small mt-1">Twitter</div>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-success w-100 p-3" onclick="shopFilterSystem.shareOnPlatform('whatsapp', '${dish.name}', '${recipeUrl}')">
                                    <i class="fab fa-whatsapp fa-2x"></i>
                                    <div class="small mt-1">WhatsApp</div>
                                </button>
                            </div>
                            <div class="col-6">
                                <button class="btn btn-outline-secondary w-100 p-3" onclick="shopFilterSystem.copyToClipboard('${shareText}')">
                                    <i class="fas fa-link fa-2x"></i>
                                    <div class="small mt-1">Copy Link</div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('shareModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();
}

// NEW: Share on specific platform
shareOnPlatform(platform, dishName, recipeUrl) {
    const text = `Check out this amazing recipe: ${dishName} - ${recipeUrl}`;
    let shareUrl;

    switch (platform) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
            break;
        default:
            return;
    }

    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('shareModal'));
    if (modal) modal.hide();
    
    this.showNotification(`📤 Shared on ${platform}!`, 'success');
}

// NEW: Copy to clipboard
copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            this.showNotification('📋 Link copied to clipboard!', 'success');
        }).catch(() => {
            this.fallbackCopy(text);
        });
    } else {
        this.fallbackCopy(text);
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('shareModal'));
    if (modal) modal.hide();
}

fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        this.showNotification('📋 Link copied to clipboard!', 'success');
    } catch (err) {
        this.showNotification('❌ Failed to copy link', 'error');
    }
    
    document.body.removeChild(textArea);
}
addToShoppingListFallback(dish) {
    try {
        const shoppingList = JSON.parse(localStorage.getItem('shoppingListFallback')) || [];
        
        // Check if dish already exists
        if (!shoppingList.some(item => item.id === dish.id)) {
            shoppingList.push({
                ...dish,
                addedAt: new Date().toISOString()
            });
            localStorage.setItem('shoppingListFallback', JSON.stringify(shoppingList));
            this.updateShoppingBagCountFallback(shoppingList.length);
        }
    } catch (error) {
        console.error('Error adding to shopping list fallback:', error);
    }
}

// Update shopping bag count fallback
updateShoppingBagCountFallback(count) {
    const bagIcon = document.querySelector('.fa-shopping-bag')?.closest('a');
    if (bagIcon) {
        let badge = bagIcon.querySelector('span');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1';
            badge.style.cssText = 'top: -5px; left: 15px; height: 20px; min-width: 20px; font-size: 12px;';
            bagIcon.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}
    fallbackShare(shareText) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Recipe link copied to clipboard!', 'success');
            }).catch(() => {
                this.ultimateFallbackShare(shareText);
            });
        } else {
            this.ultimateFallbackShare(shareText);
        }
    }

    ultimateFallbackShare(shareText) {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showNotification('📋 Recipe link copied to clipboard!', 'success');
        } catch (err) {
            this.showNotification('❌ Failed to copy link', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    // Region Selection
    initRegionSelection() {
        const globeIcon = document.querySelector('.fa-globe');
        if (globeIcon) {
            globeIcon.closest('a').addEventListener('click', (e) => {
                e.preventDefault();
                this.showRegionModal();
            });
        }
    }

    showRegionModal() {
        const modalHtml = `
            <div class="modal fade" id="regionModal" tabindex="-1">
                <div class="modal-dialog modal-sm">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">🌍 Select Region</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="list-group">
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'all' ? 'active' : ''}" 
                                        data-region="all">🌍 All Regions</button>
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'pakistani' ? 'active' : ''}" 
                                        data-region="pakistani">🇵🇰 Pakistani</button>
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'indian' ? 'active' : ''}" 
                                        data-region="indian">🇮🇳 Indian</button>
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'italian' ? 'active' : ''}" 
                                        data-region="italian">🇮🇹 Italian</button>
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'chinese' ? 'active' : ''}" 
                                        data-region="chinese">🇨🇳 Chinese</button>
                                <button type="button" class="list-group-item list-group-item-action ${this.currentFilters.region === 'mexican' ? 'active' : ''}" 
                                        data-region="mexican">🇲🇽 Mexican</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (!document.getElementById('regionModal')) {
            document.body.insertAdjacentHTML('beforeend', modalHtml);
            
            document.querySelectorAll('[data-region]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const region = e.target.dataset.region;
                    this.selectRegion(region);
                    bootstrap.Modal.getInstance(document.getElementById('regionModal')).hide();
                });
            });
        }

        const modal = new bootstrap.Modal(document.getElementById('regionModal'));
        modal.show();
    }

    selectRegion(region) {
        this.currentFilters.region = region;
        this.applyFilters();
        this.showNotification(`🌍 Region set to: ${region}`, 'info');
        
        // Update region badge
        const regionBadge = document.querySelector('.fa-globe').closest('a').querySelector('span');
        if (regionBadge) {
            regionBadge.textContent = region === 'all' ? 'All' : region.charAt(0).toUpperCase() + region.slice(1);
        }
    }

    // Shopping Bag Integration
    initShoppingBag() {
        this.updateShoppingBagCount();
    }

    updateShoppingBagCount() {
        if (!window.userManager) return;
        
        const shoppingList = window.userManager.getShoppingList();
        const bagCount = shoppingList.length;
        const bagIcon = document.querySelector('.fa-shopping-bag').closest('a');
        
        if (bagIcon) {
            let badge = bagIcon.querySelector('span');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1';
                badge.style.cssText = 'top: -5px; left: 15px; height: 20px; min-width: 20px; font-size: 12px;';
                bagIcon.appendChild(badge);
            }
            badge.textContent = bagCount;
            badge.style.display = bagCount > 0 ? 'flex' : 'none';
        }
    }

    // Utility Methods
    showLoadingState() {
        this.isLoading = true;
        const dishesContainer = document.getElementById('dishesContainer');
        if (dishesContainer) {
            dishesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary mb-3" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <h4 class="text-primary">Loading Recipes...</h4>
                    <p class="text-muted">Please wait while we load delicious recipes for you</p>
                </div>
            `;
        }
    }

    hideLoadingState() {
        this.isLoading = false;
    }

    showNotification(message, type = 'info') {
        document.querySelectorAll('.shop-notification').forEach(note => note.remove());
        
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show shop-notification position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    resetFilters() {
        this.currentFilters = {
            category: 'all',
            type: 'all',
            search: '',
            cookingTime: 'any',
            region: 'all',
            difficulty: 'any',
            dietary: 'any',
            cuisine: 'any'
        };
        
        // Reset UI elements
        const searchInput = document.getElementById('shopSearch');
        if (searchInput) searchInput.value = '';
        
        const dropdown = document.getElementById('categoryFilter');
        if (dropdown) dropdown.selectedIndex = 0;
        
        this.updateActiveCategory('all');
        this.applyFilters();
        
        this.showNotification('🔄 All filters reset', 'info');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Starting Enhanced Shop Filter System...');
    window.shopFilterSystem = new ShopFilterSystem();
});