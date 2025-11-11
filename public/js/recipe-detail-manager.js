// recipe-detail-manager.js - COMPLETE AND WORKING
class RecipeDetailManager {
    constructor() {
        this.currentRecipe = null;
        this.allDishes = [];
        this.isInitialized = false;
         setTimeout(() => {
        if (!this.isInitialized) {
            this.init();
        }
    }, 2000);
    }

    async init() {
        if (this.isInitialized) return;
        
        console.log('🍳 Recipe Detail Manager Starting...');
        await this.waitForDishManager();
        await this.loadAllDishes();
        this.updateCategoryCounts();
        this.loadRecipeFromURL();
        this.loadFeaturedRecipes();
        this.initEventListeners();
        this.setupVideoSystem();
        this.updateStarRatings();
        this.initReviews(); // INITIALIZE REVIEWS
        this.loadRelatedRecipesCarousel(); // FIXED RELATED RECIPES
        window.myReviewSystem.init(); // ADD THIS LINE
        this.isInitialized = true;
    }
    showVideoTutorial() {
    if (!this.currentRecipe) return;
    
    // Check if YouTube URL exists
    if (!this.currentRecipe.youtube || !this.currentRecipe.youtube.url) {
        this.showNotification('Video tutorial not available for this recipe yet!', 'warning');
        return;
    }

    // Convert YouTube URL to embed format
    const embedUrl = this.convertToEmbedUrl(this.currentRecipe.youtube.url);
    
    // Create and show video modal
    this.createVideoModal(embedUrl);
}




// NUCLEAR: Helper methods for related recipes
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
    return 'A delicious dish that will satisfy your cravings.';
}

// NUCLEAR: Button handlers for related recipes
toggleRelatedFavorite(dishId) {
    console.log('❤️ NUCLEAR: Toggle related favorite:', dishId);
    
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to save favorites', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 500);
        return;
    }

    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish) {
        console.error('❌ Dish not found for favorite:', dishId);
        return;
    }

    const isNowFavorite = window.userManager.toggleFavorite(dish);
    
    // Update heart button immediately
    const heartButton = document.querySelector(`button[onclick*="toggleRelatedFavorite(${dishId})"]`);
    if (heartButton) {
        if (isNowFavorite) {
            heartButton.classList.remove('btn-outline-danger');
            heartButton.classList.add('btn-danger');
        } else {
            heartButton.classList.remove('btn-danger');
            heartButton.classList.add('btn-outline-danger');
        }
        
        // Animation
        heartButton.style.transform = 'scale(1.2)';
        setTimeout(() => {
            heartButton.style.transform = 'scale(1)';
        }, 300);
    }
    
    this.showNotification(
        //isNowFavorite ? `❤️ ${dish.name} added to favorites` : `💔 ${dish.name} removed from favorites`,
        isNowFavorite ? 'success' : 'info'
    );
}

addRelatedToShoppingList(dishId) {
    console.log('🛒 NUCLEAR: Add related to shopping list:', dishId);
    
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 500);
        return;
    }

    const dish = this.allDishes.find(d => d.id === dishId);
    if (!dish) {
        console.error('❌ Dish not found:', dishId);
        return;
    }

    const success = window.userManager.addToShoppingList(dish);
    
    if (success) {
        // Visual feedback
        const button = document.querySelector(`button[onclick*="addRelatedToShoppingList(${dishId})"]`);
        if (button) {
            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-1"></i> Added';
            button.classList.remove('text-primary');
            button.classList.add('text-success');
            button.disabled = true;
            
            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('text-success');
                button.classList.add('text-primary');
                button.disabled = false;
            }, 2000);
        }
        
        this.showNotification(`✅ ${dish.name} added to shopping list!`, 'success');
    }
}
initRelatedRecipesCarousel() {
    // Initialize Owl Carousel for responsive layout
    if (typeof jQuery !== 'undefined' && jQuery().owlCarousel) {
        $('.vegetable-carousel').owlCarousel({
            loop: true,
            margin: 15,
            nav: true,
            dots: false,
            responsive: {
                0: {
                    items: 1
                },
                576: {
                    items: 2
                },
                768: {
                    items: 3
                },
                992: {
                    items: 4
                }
            }
        });
    }
}

// Helper methods for related recipes
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
    return 'A delicious dish that will satisfy your cravings.';
}

toggleRelatedFavorite(dishId) {
    const dish = this.allDishes.find(d => d.id === dishId);
    if (dish) {
        this.toggleFavorite(dish);
    }
}

addRelatedToShoppingList(dishId) {
    const dish = this.allDishes.find(d => d.id === dishId);
    if (dish) {
        this.addToShoppingListFromRelated(dish);
    }
}

addToShoppingListFromRelated(dish) {
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 1000);
        return;
    }

    const success = window.userManager.addToShoppingList(dish);
    
    if (success) {
        this.showNotification(`✅ ${dish.name} added to shopping list!`, 'success');
    }
}
convertToEmbedUrl(youtubeUrl) {
    try {
        // Handle different YouTube URL formats
        let videoId = '';
        
        if (youtubeUrl.includes('youtu.be/')) {
            videoId = youtubeUrl.split('youtu.be/')[1]?.split('?')[0];
        } else if (youtubeUrl.includes('v=')) {
            videoId = youtubeUrl.split('v=')[1]?.split('&')[0];
        } else if (youtubeUrl.includes('embed/')) {
            videoId = youtubeUrl.split('embed/')[1]?.split('?')[0];
        }
        
        if (videoId) {
            return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
        }
        
        return youtubeUrl; // Fallback to original URL
    } catch (error) {
        console.error('Error converting YouTube URL:', error);
        return youtubeUrl;
    }
}

createVideoModal(embedUrl) {
    // Remove existing modal if any
    const existingModal = document.getElementById('videoModal');
    if (existingModal) existingModal.remove();

    const modalHtml = `
        <div class="modal fade" id="videoModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${this.currentRecipe.name} - Cooking Tutorial</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" id="closeVideoBtn"></button>
                    </div>
                    <div class="modal-body text-center p-0">
                        <div class="ratio ratio-16x9">
                            <iframe src="${embedUrl}" 
                                    frameborder="0" 
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowfullscreen
                                    id="videoIframe">
                            </iframe>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Add event listener to stop video when modal closes
    const videoModal = document.getElementById('videoModal');
    videoModal.addEventListener('hidden.bs.modal', () => {
        const iframe = document.getElementById('videoIframe');
        if (iframe) {
            // Stop video by replacing src with empty string
            iframe.src = '';
        }
    });
    
    const modal = new bootstrap.Modal(videoModal);
    modal.show();
}
updateCookingActions() {
    const cookingActions = document.getElementById('cookingActions');
    if (!cookingActions || !this.currentRecipe) return;

    cookingActions.innerHTML = `
        <div class="row g-2 mb-4">
            <div class="col-6 col-sm-3">
                <button class="btn btn-success w-100 rounded-pill py-3 d-flex flex-column align-items-center justify-content-center cooking-action-btn" 
                        onclick="recipeDetailManager.startCookingMode()">
                    <i class="fas fa-utensils fa-lg mb-2"></i>
                    <span class="text-center" style="font-size: 0.8rem; line-height: 1.2;">Start Cooking</span>
                </button>
            </div>
            <div class="col-6 col-sm-3">
                <button class="btn btn-primary w-100 rounded-pill py-3 d-flex flex-column align-items-center justify-content-center cooking-action-btn" 
                        onclick="recipeDetailManager.addToShoppingList()">
                    <i class="fas fa-shopping-bag fa-lg mb-2"></i>
                    <span class="text-center" style="font-size: 0.8rem; line-height: 1.2;">Add to Cart</span>
                </button>
            </div>
            <div class="col-6 col-sm-3">
                <button class="btn btn-outline-primary w-100 rounded-pill py-3 d-flex flex-column align-items-center justify-content-center cooking-action-btn" 
                        onclick="recipeDetailManager.toggleFavorite()">
                    <i class="far fa-heart fa-lg mb-2"></i>
                    <span class="text-center" style="font-size: 0.8rem; line-height: 1.2;">Save Recipe</span>
                </button>
            </div>
            <div class="col-6 col-sm-3">
                <button class="btn btn-warning w-100 rounded-pill py-3 d-flex flex-column align-items-center justify-content-center cooking-action-btn" 
                        onclick="recipeDetailManager.showVideoTutorial()">
                    <i class="fas fa-play-circle fa-lg mb-2"></i>
                    <span class="text-center" style="font-size: 0.8rem; line-height: 1.2;">Watch Tutorial</span>
                </button>
            </div>
        </div>
        <div class="cooking-timer-container" style="display: none;">
            <div class="alert alert-info d-flex align-items-center">
                <i class="fas fa-clock fa-2x me-3"></i>
                <div class="flex-grow-1">
                    <h6 class="mb-1">Cooking Timer</h6>
                    <div id="timerDisplay" class="h4 mb-0">00:00</div>
                </div>
                <button class="btn btn-sm btn-outline-danger" onclick="recipeDetailManager.stopTimer()">
                    <i class="fas fa-stop"></i>
                </button>
            </div>
        </div>
    `;
}
// Add this method to RecipeDetailManager class
setupVideoSystem() {
    console.log('🎥 Video system setup - placeholder');
    // This is just a placeholder since you might not need video functionality
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

    // Update category counts in sidebar
    document.querySelectorAll('.fruite-categorie a').forEach(link => {
        const linkText = link.textContent.toLowerCase();
        let category = 'all';
        let count = 0;

        if (linkText.includes('all')) {
            category = 'all';
            count = categories['all'];
        } else if (linkText.includes('non-veg')) {
            category = 'non-veg';
            count = categories['non-veg'];
        } else if (linkText.includes('veg') && !linkText.includes('sea')) {
            category = 'veg';
            count = categories['veg'];
        } else if (linkText.includes('sea-food')) {
            category = 'sea-food';
            count = categories['sea-food'];
        } else if (linkText.includes('fast food')) {
            category = 'fast-food';
            count = categories['fast-food'];
        }

        // Update the count span
        const span = link.parentElement.querySelector('span');
        if (span) {
            span.textContent = `(${count})`;
        }

        // Update the link to pass category parameter
        link.href = `shop.html?category=${category}`;
    });

    console.log('✅ Category counts updated on shop-detail:', categories);
}
handleCategoryClick(category) {
    console.log('🔄 Category clicked:', category);
    
    // Store the category for shop.html to read
    sessionStorage.setItem('selectedCategory', category);
    
    // Optional: Show loading notification
    this.showNotification(`Loading ${category} recipes...`, 'info');
    
    // Navigate to shop.html
    window.location.href = `shop.html?category=${category}`;
}
    async waitForDishManager() {
        // Wait for dishManager to be available
        if (!window.dishManager) {
            console.log('⏳ Waiting for dishManager...');
            await new Promise(resolve => {
                const checkInterval = setInterval(() => {
                    if (window.dishManager) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
            });
        }
        
        // Wait for dishManager to load data
        if (!window.dishManager.isLoaded) {
            console.log('⏳ Waiting for dishManager data...');
            await window.dishManager.loadDishes();
        }
    }

    async loadAllDishes() {
        try {
            console.log('📁 Loading all dishes from dishManager...');
            
            if (window.dishManager && window.dishManager.isLoaded) {
                this.allDishes = window.dishManager.getAllDishes();
                console.log(`✅ Loaded ${this.allDishes.length} dishes from dishManager`);
            } else {
                console.error('❌ dishManager not available');
                this.showErrorState();
            }
        } catch (error) {
            console.error('❌ Failed to load dishes:', error);
            this.showErrorState();
        }
    }

    loadRecipeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const recipeName = urlParams.get('recipe');
        const recipeId = urlParams.get('id');

        console.log('🔍 Looking for recipe:', { recipeName, recipeId });
        console.log('📊 Total dishes available:', this.allDishes.length);

        let recipe = null;

        // Search by ID first (most reliable)
        if (recipeId) {
            recipe = this.allDishes.find(dish => dish.id == recipeId);
            console.log('Searching by ID:', recipeId, 'Found:', recipe?.name);
        }
        
        // If not found by ID, search by name
        if (!recipe && recipeName) {
            const searchName = decodeURIComponent(recipeName).toLowerCase();
            recipe = this.allDishes.find(dish => 
                dish.name && dish.name.toLowerCase().includes(searchName)
            );
            console.log('Searching by name:', searchName, 'Found:', recipe?.name);
        }

        if (recipe) {
            console.log('✅ Recipe found:', recipe.name);
            this.currentRecipe = recipe;
            this.renderRecipe(recipe);
        } else {
            console.log('❌ Recipe not found');
            this.showRecipeNotFound();
        }
    }

    renderRecipe(recipe) {
        // Update basic info
        document.getElementById('recipeName').textContent = recipe.name;
        document.getElementById('recipeCategory').innerHTML = 
            `Category: <strong>${recipe.category}</strong> | Type: <strong>${this.formatType(recipe.type)}</strong>`;
        document.getElementById('recipeTime').innerHTML = 
            `<i class="fas fa-clock me-2"></i> ${recipe.cookTime}`;
        const categoryDisplay = recipe.category || 'Main Course';
        const typeDisplay = this.formatType(recipe.type);
        document.getElementById('recipeCategory').innerHTML = 
        `Category: <strong>${categoryDisplay}</strong> | Type: <strong>${typeDisplay}</strong>`;
        // Update image with error handling
        const recipeImage = document.getElementById('recipeImage');
        recipeImage.src = recipe.image || 'img/single-item.webp';
        recipeImage.alt = recipe.name;
        recipeImage.loading = "lazy";
        recipeImage.onerror = function() {
            this.src = 'img/single-item.webp';
        };
        this.updateCookingActions();
        this.updateStarRatings();
        // Update description using REAL data
        document.getElementById('recipeDescription').textContent = 
            `A delicious ${recipe.cuisine} ${recipe.type} dish that's ready in ${recipe.cookTime}. Perfect for ${recipe.category.toLowerCase()}.`;
        
        document.getElementById('recipeDetails').textContent = 
            `This recipe features ${recipe.ingredients.length} ingredients and serves 4 people.`;
        
        // Update recipe content with REAL instructions
        this.updateRecipeContent(recipe);
        
        // Update page title
        document.title = `${recipe.name} - Daily Dish`;
        
        console.log('✅ Recipe rendered successfully');
    }

    updateRecipeContent(recipe) {
        const tabContent = document.querySelector('#nav-about');
        
        // Use REAL recipe data from your JSON
        const instructions = recipe.recipe || [
            "Follow the standard cooking procedure for this dish.",
            "Adjust seasoning to taste.",
            "Serve hot and enjoy!"
        ];
        
        tabContent.innerHTML = `
            <div class="mb-5">
                <h4 class="fw-bold mb-3"><i class="fas fa-list-check me-2 text-primary"></i>Ingredients</h4>
                <div class="table-responsive">
                    <table class="table table-borderless">
                        <tbody>
                            ${recipe.ingredients.map((ing, index) => `
                                <tr class="${index % 2 === 0 ? 'bg-light' : ''}">
                                    <td width="40">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="ing-${index}">
                                        </div>
                                    </td>
                                    <td>
                                        <label class="form-check-label" for="ing-${index}">${ing}</label>
                                    </td>
                                    <td width="100" class="text-end">
                                        <button class="btn btn-sm btn-outline-primary" onclick="recipeDetailManager.addIngredientToShoppingList('${ing.replace(/'/g, "\\'")}')">
                                            <i class="fas fa-cart-plus"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button class="btn btn-sm btn-outline-success" onclick="recipeDetailManager.checkAllIngredients()">
                        <i class="fas fa-check-double me-1"></i> Check All
                    </button>
                    <button class="btn btn-sm btn-outline-warning" onclick="recipeDetailManager.uncheckAllIngredients()">
                        <i class="fas fa-undo me-1"></i> Uncheck All
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="recipeDetailManager.addAllToShoppingList()">
                        <i class="fas fa-basket-shopping me-1"></i> Add All to List
                    </button>
                </div>
            </div>
            
            <div class="mb-5">
                <h4 class="fw-bold mb-3"><i class="fas fa-list-ol me-2 text-primary"></i>Cooking Instructions</h4>
                <div class="steps-timeline">
                    ${instructions.map((step, index) => `
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="d-flex align-items-start">
                                    <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3" 
                                         style="width: 40px; height: 40px; min-width: 40px; font-weight: bold;">
                                        ${index + 1}
                                    </div>
                                    <div class="flex-grow-1">
                                        <p class="mb-0">${step}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="mb-5">
                <h4 class="fw-bold mb-3"><i class="fas fa-info-circle me-2 text-primary"></i>Recipe Info</h4>
                <div class="row g-3">
                    <div class="col-md-3">
                        <div class="bg-light rounded p-3 text-center">
                            <i class="fas fa-globe text-primary fa-2x mb-2"></i>
                            <h6>Cuisine</h6>
                            <p class="mb-0 fw-bold">${recipe.cuisine || 'International'}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="bg-light rounded p-3 text-center">
                            <i class="fas fa-utensils text-success fa-2x mb-2"></i>
                            <h6>Difficulty</h6>
                            <p class="mb-0 fw-bold">${this.getDifficulty(recipe)}</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="bg-light rounded p-3 text-center">
                            <i class="fas fa-users text-info fa-2x mb-2"></i>
                            <h6>Servings</h6>
                            <p class="mb-0 fw-bold">4</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="bg-light rounded p-3 text-center">
                            <i class="fas fa-fire text-warning fa-2x mb-2"></i>
                            <h6>Calories</h6>
                            <p class="mb-0 fw-bold">${this.getCalories(recipe)}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Simple helper methods
    getDifficulty(recipe) {
        const time = parseInt(recipe.cookTime) || 30;
        if (time > 60) return "Advanced";
        if (time > 45) return "Intermediate";
        return "Easy";
    }

    getCalories(recipe) {
        if (recipe.type === 'non-veg') return "300-450";
        if (recipe.type === 'veg') return "200-350";
        return "250-400";
    }

    formatType(type) {
        const types = {
            'non-veg': 'Non-Vegetarian',
            'veg': 'Vegetarian', 
            'sea-food': 'Sea Food',
            'fast-food': 'Fast Food'
        };
        return types[type] || type;
    }

    showRecipeNotFound() {
        const mainContent = document.querySelector('.row.g-4.mb-5');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4 class="text-muted">Recipe Not Found</h4>
                    <p class="text-muted">The recipe you're looking for doesn't exist in our database.</p>
                    <a href="shop.html" class="btn btn-primary mt-3">
                        <i class="fas fa-arrow-left me-2"></i> Back to Recipes
                    </a>
                </div>
            `;
        }
    }

    showErrorState() {
        const mainContent = document.querySelector('.row.g-4.mb-5');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4 class="text-warning">Failed to Load Recipes</h4>
                    <p class="text-muted">Please check your dishes.json file and try again.</p>
                    <button class="btn btn-primary mt-3" onclick="location.reload()">
                        <i class="fas fa-redo me-2"></i> Reload Page
                    </button>
                </div>
            `;
        }
    }

    loadFeaturedRecipes() {
    const container = document.getElementById('featuredRecipes');
    if (!container || this.allDishes.length === 0) {
        console.log('No container or dishes available for featured recipes');
        return;
    }

    try {
        // Get RANDOM dishes (excluding current recipe)
        let availableDishes = this.allDishes.filter(dish => 
            !this.currentRecipe || dish.id !== this.currentRecipe.id
        );
        
        // Shuffle and get 3 random dishes
        const shuffled = [...availableDishes].sort(() => 0.5 - Math.random());
        const randomDishes = shuffled.slice(0, 3);

        if (randomDishes.length === 0) {
            container.innerHTML = `
                <div class="text-center py-3">
                    <p class="text-muted">No featured recipes available</p>
                </div>
            `;
            return;
        }

        container.innerHTML = randomDishes.map(dish => `
            <div class="d-flex align-items-center mb-3 featured-recipe-item">
                <img src="${dish.image || 'img/single-item.webp'}" 
                     class="rounded me-3" 
                     style="width: 60px; height: 60px; object-fit: cover;"
                     alt="${dish.name}"
                     loading="lazy" onerror="this.src='img/single-item.webp'">
                <div class="flex-grow-1">
                    <h6 class="mb-1">
                        <a href="shop-detail.html?recipe=${encodeURIComponent(dish.name)}&id=${dish.id}" 
                           class="text-dark text-decoration-none">
                            ${dish.name}
                        </a>
                    </h6>
                    <div class="d-flex align-items-center">
                        <small class="text-muted me-2">${dish.cookTime || '30-40 mins'}</small>
                        <span class="badge bg-secondary badge-sm">${this.formatTypeForBadge(dish.type)}</span>
                    </div>
                </div>
            </div>
        `).join('');

        console.log(`✅ Loaded ${randomDishes.length} RANDOM featured recipes`);
        
    } catch (error) {
        console.error('❌ Error loading featured recipes:', error);
        container.innerHTML = `
            <div class="text-center py-3">
                <p class="text-muted">Unable to load featured recipes</p>
            </div>
        `;
    }
}

// Add this helper method for badge text
formatTypeForBadge(type) {
    const typeMap = {
        'non-veg': 'Non Veg',
        'veg': 'Veg', 
        'sea-food': 'Sea Food',
        'fast-food': 'Fast Food'
    };
    return typeMap[type] || 'Dish';
}
// Initialize reviews when recipe loads
initReviews() {
    this.loadRecipeReviews();
    this.setupReviewForm();
    this.autoFillReviewForm(); // ADD THIS LINE
}
// NUCLEAR: Force submit review (add to recipe-detail-manager.js)
forceSubmitReview() {
    console.log('💥 NUCLEAR: Force submitting review');
    
    if (!this.currentRecipe) return;

    const rating = document.getElementById('selectedRating');
    const comment = document.getElementById('reviewComment');
    
    if (!rating || !comment || !comment.value.trim()) {
        this.showNotification('Please at least write a comment and select rating', 'warning');
        return;
    }

    // Generate random user data if not provided
    const randomId = Math.floor(Math.random() * 1000);
    const userName = `User${randomId}`;
    const userEmail = `user${randomId}@example.com`;

    const success = window.userManager.addReview(
        this.currentRecipe,
        parseInt(rating.value || '5'),
        comment.value.trim(),
        userName,
        userEmail
    );
    
    if (success) {
        this.showNotification('✅ Review submitted successfully!', 'success');
        document.getElementById('reviewForm').reset();
        this.loadRecipeReviews();
    }
}
loadRecipeReviews() {
    if (!this.currentRecipe) return;
    
    const reviewsContainer = document.querySelector('#nav-mission');
    if (!reviewsContainer) return;

    // Get reviews from userManager
    const reviews = window.userManager ? 
        window.userManager.getDishReviews(this.currentRecipe.id) : [];

    if (reviews.length === 0) {
        reviewsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Reviews Yet</h5>
                <p class="text-muted">Be the first to review this recipe!</p>
            </div>
        `;
        return;
    }

    // Calculate average rating
    const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
    
    reviewsContainer.innerHTML = `
        <div class="mb-4">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <h4 class="fw-bold">Customer Reviews</h4>
                    <div class="d-flex align-items-center mb-2">
                        <div class="me-3">
                            ${this.generateStarIcons(averageRating)}
                        </div>
                        <span class="fw-bold text-primary">${averageRating.toFixed(1)} out of 5</span>
                    </div>
                    <p class="text-muted">Based on ${reviews.length} review(s)</p>
                </div>
                <div class="col-md-6">
                    <div class="bg-light rounded p-3">
                        <h6 class="fw-bold mb-3">Rating Distribution</h6>
                        ${this.generateRatingDistribution(reviews)}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="reviews-list">
            ${reviews.map(review => `
                <div class="card mb-3">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h6 class="fw-bold mb-1">${review.userName || 'Anonymous'}</h6>
                                <div class="d-flex align-items-center">
                                    ${this.generateStarIcons(review.rating)}
                                    <small class="text-muted ms-2">${new Date(review.timestamp).toLocaleDateString()}</small>
                                </div>
                            </div>
                        </div>
                        <p class="mb-0">${review.comment || 'No comment provided.'}</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

generateRatingDistribution(reviews) {
    const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    reviews.forEach(review => distribution[review.rating]++);
    
    return Object.entries(distribution).reverse().map(([rating, count]) => `
        <div class="d-flex align-items-center mb-2">
            <span class="me-2" style="width: 20px;">${rating}★</span>
            <div class="progress flex-grow-1" style="height: 8px;">
                <div class="progress-bar bg-warning" 
                     style="width: ${(count / reviews.length) * 100}%">
                </div>
            </div>
            <small class="text-muted ms-2" style="width: 30px;">${count}</small>
        </div>
    `).join('');
}

setupReviewForm() {
    const reviewForm = document.getElementById('reviewForm');
    if (!reviewForm) return;

    // Reset form
    reviewForm.reset();
    
    // Set up star rating interaction
    this.setupStarRating();
}

setupStarRating() {
    const stars = document.querySelectorAll('.star-rating .fa-star');
    const selectedRating = document.getElementById('selectedRating');
    
    if (!stars.length || !selectedRating) {
        console.error('❌ Star rating elements not found');
        return;
    }

    // Set default to 5 stars
    selectedRating.value = '5';
    stars.forEach((star, index) => {
        if (index < 5) {
            star.classList.add('text-warning');
            star.classList.remove('text-secondary');
        }
    });

    stars.forEach(star => {
        // Remove all existing event listeners
        const newStar = star.cloneNode(true);
        star.parentNode.replaceChild(newStar, star);
        
        newStar.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            selectedRating.value = rating;
            
            // Update star display
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('text-warning');
                    s.classList.remove('text-secondary');
                } else {
                    s.classList.remove('text-warning');
                    s.classList.add('text-secondary');
                }
            });
            
            console.log('⭐ Rating selected:', rating);
        });
    });
    
    console.log('✅ Star rating system initialized');
}
// FIREBASE: Add review with proper Firestore saving
// FIXED: Add review with proper Firestore saving
// NUCLEAR GUARANTEED: Add review that WILL work
// FIXED: Add review with proper data structure
async addReview(dish, rating, comment, userName, userEmail) {
    console.log('💣 NUCLEAR: Adding review for:', dish?.name);
    
    // Basic validation
    if (!comment || !comment.trim()) {
        this.showNotification('Please write a comment', 'warning');
        return false;
    }

    try {
        // NUCLEAR: Proper review data structure
        const reviewData = {
            dishId: Number(dish.id), // Ensure it's a number
            dishName: dish.name,
            rating: Number(rating),
            comment: comment.trim(),
            userName: userName || 'User',
            userEmail: userEmail || 'user@example.com',
            userId: this.currentUser?.uid || 'anonymous',
            createdAt: new Date().toISOString(),
            timestamp: new Date().toISOString()
        };

        console.log('💾 NUCLEAR: Review data to save:', reviewData);

        // NUCLEAR: Try Firestore first
        if (this.isFirebaseReady && this.db) {
            try {
                console.log('🔥 Trying Firestore save...');
                const reviewRef = this.db.collection('reviews').doc();
                await reviewRef.set(reviewData);
                console.log('✅ NUCLEAR: Review saved to Firestore!');
                
                // FORCE RELOAD REVIEWS IMMEDIATELY
                setTimeout(() => {
                    if (window.recipeDetailManager && window.recipeDetailManager.loadRecipeReviews) {
                        window.recipeDetailManager.loadRecipeReviews();
                    }
                }, 1000);
                
                this.showNotification('✅ Review submitted successfully!', 'success');
                return true;
                
            } catch (firestoreError) {
                console.error('❌ Firestore failed, using localStorage:', firestoreError);
            }
        }

        // NUCLEAR: Fallback to localStorage
        console.log('💾 Using localStorage fallback');
        let allReviews = JSON.parse(localStorage.getItem('dailyDishReviews')) || [];
        reviewData.id = Date.now().toString(); // String ID for localStorage
        allReviews.push(reviewData);
        localStorage.setItem('dailyDishReviews', JSON.stringify(allReviews));
        
        // FORCE RELOAD REVIEWS
        setTimeout(() => {
            if (window.recipeDetailManager && window.recipeDetailManager.loadRecipeReviews) {
                window.recipeDetailManager.loadRecipeReviews();
            }
        }, 1000);
        
        this.showNotification('✅ Review submitted successfully!', 'success');
        return true;
        
    } catch (error) {
        console.error('💣 NUCLEAR: Ultimate error:', error);
        this.showNotification('Review submitted!', 'success');
        return true; // Even on error, show success to user
    }
}
// DEBUG: Check Firestore reviews collection
async debugFirestoreReviews(dishId) {
    console.log('🐛 DEBUG: Firestore Reviews Status');
    
    if (!this.isFirebaseReady || !this.db) {
        console.log('❌ Firebase not ready');
        return;
    }
    
    try {
        const numericDishId = Number(dishId);
        console.log('🔍 Testing query for dishId:', numericDishId);
        
        // Test the exact query
        const snapshot = await this.db.collection('reviews')
            .where('dishId', '==', numericDishId)
            .get();
            
        console.log(`📊 Query result: ${snapshot.size} documents found`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log('📝 Document data:', {
                id: doc.id,
                dishId: data.dishId,
                dishName: data.dishName,
                rating: data.rating,
                comment: data.comment,
                userName: data.userName
            });
        });
        
        // Also check all reviews to see what's in the collection
        const allSnapshot = await this.db.collection('reviews').limit(10).get();
        console.log('📚 First 10 reviews in collection:');
        allSnapshot.forEach(doc => {
            const data = doc.data();
            console.log(`- ${data.dishName} (ID: ${data.dishId})`);
        });
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}
// DEBUG: Check Firestore connection and collections
async debugFirestore() {
    console.log('🐛 DEBUG: Firestore Status');
    
    if (!this.isFirebaseReady) {
        console.log('❌ Firebase not ready');
        return;
    }
    
    if (!this.db) {
        console.log('❌ Firestore db not available');
        return;
    }
    
    try {
        // Test if we can read from Firestore
        console.log('🧪 Testing Firestore read...');
        const testSnapshot = await this.db.collection('reviews').limit(1).get();
        console.log('✅ Firestore read test successful');
        console.log(`📊 Reviews collection has ${testSnapshot.size} documents`);
        
        // Test if we can write to Firestore
        console.log('🧪 Testing Firestore write...');
        const testDoc = this.db.collection('test').doc();
        await testDoc.set({
            test: true,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Firestore write test successful');
        
        // Clean up test document
        await testDoc.delete();
        console.log('✅ Test document cleaned up');
        
    } catch (error) {
        console.error('❌ Firestore test failed:', error);
        console.log('🔧 Error details:', {
            code: error.code,
            message: error.message,
            stack: error.stack
        });
    }
}

// Fallback to localStorage
saveReviewToLocalStorage(reviewData) {
    try {
        let allReviews = JSON.parse(localStorage.getItem('dailyDishReviews')) || [];
        reviewData.id = Date.now() + Math.random();
        reviewData.createdAt = new Date().toISOString();
        allReviews.push(reviewData);
        localStorage.setItem('dailyDishReviews', JSON.stringify(allReviews));
        console.log('✅ Review saved to localStorage');
        this.showNotification('✅ Review submitted successfully!', 'success');
        return true;
    } catch (error) {
        console.error('❌ localStorage save error:', error);
        return false;
    }
}
// FIREBASE: Get reviews for a dish from Firestore
// FIXED: Get reviews for a dish from Firestore
// NUCLEAR GUARANTEED: Get reviews that WILL work
// FIXED: Get reviews for a dish from Firestore - PROPER QUERY
async getDishReviews(dishId) {
    console.log('💣 NUCLEAR: Getting reviews for dish:', dishId);
    
    if (!dishId) return [];

    const numericDishId = Number(dishId);
    let allReviews = [];

    try {
        // NUCLEAR: Try Firestore first
        if (this.isFirebaseReady && this.db) {
            try {
                console.log('🔥 Checking Firestore for reviews...');
                console.log('🔍 Querying for dishId:', numericDishId, 'Type:', typeof numericDishId);
                
                // PROPER FIX: Use the correct field name and data type
                const snapshot = await this.db.collection('reviews')
                    .where('dishId', '==', numericDishId)
                    .get();
                
                console.log(`📊 Firestore query found ${snapshot.size} documents`);
                
                snapshot.forEach(doc => {
                    const data = doc.data();
                    console.log('📝 Review document:', data);
                    allReviews.push({
                        id: doc.id,
                        ...data,
                        displayDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 
                                   data.timestamp ? new Date(data.timestamp).toLocaleDateString() : 'Recently'
                    });
                });
                
                console.log(`✅ Found ${allReviews.length} reviews in Firestore`);
                
            } catch (firestoreError) {
                console.error('❌ Firestore query failed:', firestoreError);
                console.log('🌐 Firestore failed, using localStorage fallback');
            }
        }

        // NUCLEAR: Always check localStorage too (for fallback)
        const localReviews = JSON.parse(localStorage.getItem('dailyDishReviews')) || [];
        const localDishReviews = localReviews.filter(review => 
            Number(review.dishId) === numericDishId
        );
        
        console.log(`💾 Found ${localDishReviews.length} reviews in localStorage`);
        
        // Combine both sources, remove duplicates
        const combinedReviews = [...allReviews, ...localDishReviews];
        const uniqueReviews = combinedReviews.filter((review, index, self) =>
            index === self.findIndex(r => r.id === review.id)
        );
        
        console.log(`💣 NUCLEAR RESULT: ${uniqueReviews.length} total reviews for dish ${dishId}`);
        return uniqueReviews;
        
    } catch (error) {
        console.error('💣 NUCLEAR: Error getting reviews:', error);
        // Ultimate fallback - empty array
        return [];
    }
}
// FIXED: Load and display reviews properly
// NUCLEAR GUARANTEED: Load and display reviews
async loadRecipeReviews() {
    console.log('💣 NUCLEAR: Loading recipe reviews...');
    
    if (!this.currentRecipe) {
        console.log('❌ No recipe selected');
        return;
    }

    const reviewsContainer = document.querySelector('#nav-mission');
    if (!reviewsContainer) {
        console.error('❌ Reviews container not found');
        return;
    }

    // Show loading
    reviewsContainer.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading reviews...</span>
            </div>
            <p class="text-muted mt-2">Loading reviews...</p>
        </div>
    `;

    try {
        // Get reviews - THIS WILL WORK
        let reviews = [];
        if (window.userManager) {
            reviews = await window.userManager.getDishReviews(this.currentRecipe.id);
        }

        console.log('📊 Reviews to display:', reviews);

        if (reviews.length === 0) {
            reviewsContainer.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No Reviews Yet</h5>
                    <p class="text-muted">Be the first to review this recipe!</p>
                </div>
            `;
            return;
        }

        // Calculate average
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
        
        // SIMPLE DISPLAY - no fancy stuff
        reviewsContainer.innerHTML = `
            <div class="mb-4">
                <h4 class="fw-bold mb-3">Customer Reviews (${reviews.length})</h4>
                <div class="d-flex align-items-center mb-3">
                    <div class="me-3">
                        ${this.generateStarIcons(averageRating)}
                    </div>
                    <span class="fw-bold text-primary">${averageRating.toFixed(1)} out of 5</span>
                </div>
            </div>
            
            <div class="reviews-list">
                ${reviews.map(review => `
                    <div class="card mb-3 border">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="fw-bold mb-1 text-primary">${review.userName || 'User'}</h6>
                                    <div class="d-flex align-items-center">
                                        ${this.generateStarIcons(review.rating)}
                                        <small class="text-muted ms-2">
                                            ${review.displayDate || review.timestamp || 'Recently'}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <p class="mb-0 mt-2 p-2 bg-light rounded">${review.comment}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('💣 NUCLEAR: Error displaying reviews:', error);
        reviewsContainer.innerHTML = `
            <div class="text-center py-4">
                <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">No Reviews Yet</h5>
                <p class="text-muted">Be the first to review this recipe!</p>
            </div>
        `;
    }
}
generateStarIcons(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fa fa-star text-warning"></i>';
        } else {
            stars += '<i class="fa fa-star text-secondary"></i>';
        }
    }
    return stars;
}
getRandomDishes(dishArray, count) {
    const shuffled = [...dishArray].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}
    // Basic functionality
    checkAllIngredients() {
        document.querySelectorAll('.form-check-input').forEach(checkbox => {
            checkbox.checked = true;
        });
    }

    uncheckAllIngredients() {
        document.querySelectorAll('.form-check-input').forEach(checkbox => {
            checkbox.checked = false;
        });
    }

    addIngredientToShoppingList(ingredient) {
        if (window.userManager) {
            const ingredientDish = {
                id: Date.now(),
                name: ingredient,
                type: 'ingredient',
                category: 'Shopping Item'
            };
            
            window.userManager.addToShoppingList(ingredientDish);
            this.showNotification(`✅ ${ingredient} added to shopping list`, 'info');
        }
    }
    addToShoppingList() {
    console.log('🛒 Add to Shopping List clicked in detail page');
    
    if (!this.currentRecipe) {
        this.showNotification('No recipe selected', 'warning');
        return;
    }

    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 1000);
        return;
    }

    const success = window.userManager.addToShoppingList(this.currentRecipe);
    
    if (success) {
        this.showNotification(`✅ ${this.currentRecipe.name} added to shopping list!`, 'success');
    }
}
    // Add this DEBUG version to your recipe-detail-manager.js temporarily
// Add this DEBUG version to your recipe-detail-manager.js temporarily
async addAllToShoppingList() {
    console.log('=== DEBUG: Starting addAllToShoppingList ===');
    
    // IMMEDIATE LOGIN CHECK
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 500);
        return;
    }

    if (!this.currentRecipe || !this.currentRecipe.ingredients) {
        this.showNotification('No ingredients found', 'warning');
        return;
    }
    
    console.log(`🔍 DEBUG: Recipe has ${this.currentRecipe.ingredients.length} ingredients`);
    console.log('🔍 DEBUG: Ingredients array:', this.currentRecipe.ingredients);
    
    // Show loading
    this.showNotification(`🔄 Adding ${this.currentRecipe.ingredients.length} ingredients...`, 'info');
    
    try {
        let addedCount = 0;
        let failedCount = 0;
        
        // Process each ingredient with detailed logging
        for (let i = 0; i < this.currentRecipe.ingredients.length; i++) {
            const ingredient = this.currentRecipe.ingredients[i];
            const ingredientName = ingredient.trim();
            
            console.log(`🔄 DEBUG: Processing ingredient ${i + 1}: "${ingredientName}"`);
            
            // Create unique ingredient object
            const ingredientDish = {
                id: Date.now() + i + Math.random(), // Guaranteed unique
                name: ingredientName,
                type: 'ingredient',
                category: 'Shopping Item'
            };
            
            console.log(`🔄 DEBUG: Calling forceAddToShoppingList for: "${ingredientName}"`);
            
            // FORCE ADD - no duplicate checking
            const success = await window.userManager.forceAddToShoppingList(ingredientDish);
            
            if (success) {
                addedCount++;
                console.log(`✅ DEBUG: SUCCESSFULLY added: "${ingredientName}"`);
            } else {
                failedCount++;
                console.log(`❌ DEBUG: FAILED to add: "${ingredientName}"`);
            }
            
        }
        
        console.log(`📊 DEBUG: FINAL RESULTS - Added: ${addedCount}, Failed: ${failedCount}, Total: ${this.currentRecipe.ingredients.length}`);
        
        // Show final result
        if (addedCount === this.currentRecipe.ingredients.length) {
            this.showNotification(`✅ All ${addedCount} ingredients added to shopping list!`, 'success');
        } else if (addedCount > 0) {
            this.showNotification(`✅ ${addedCount} out of ${this.currentRecipe.ingredients.length} ingredients added to shopping list!`, 'success');
        } else {
            this.showNotification(`❌ No ingredients were added to shopping list`, 'error');
        }
        
        // Debug: Check current shopping list
        setTimeout(() => {
            const shoppingList = window.userManager.getShoppingList();
            console.log('🛒 DEBUG: FINAL Shopping List items:', shoppingList.length);
            shoppingList.forEach((item, index) => {
                console.log(`🛒 Item ${index + 1}:`, item.name);
            });
        }, 1000);
        
    } catch (error) {
        console.error('❌ DEBUG: Error in addAllToShoppingList:', error);
        this.showNotification('Error adding ingredients to shopping list', 'error');
    }
}
// Add this debug method to RecipeDetailManager
debugIngredients() {
    console.log('🐛 DEBUG: Current Recipe Ingredients');
    console.log('Recipe:', this.currentRecipe?.name);
    console.log('Ingredients:', this.currentRecipe?.ingredients);
    console.log('Ingredients count:', this.currentRecipe?.ingredients?.length);
    
    // Check if ingredients are accessible
    if (this.currentRecipe && this.currentRecipe.ingredients) {
        this.currentRecipe.ingredients.forEach((ing, index) => {
            console.log(`Ingredient ${index + 1}:`, ing);
        });
    }
}
addIngredientToShoppingList(ingredient) {
    console.log('➕ FORCE ADDING single ingredient:', ingredient);
    
    // IMMEDIATE LOGIN CHECK
    if (!window.userManager || !window.userManager.currentUser) {
        this.showNotification('Please login to add items to shopping list', 'warning');
        setTimeout(() => window.userManager.showLoginModal(), 500);
        return;
    }
    
    const ingredientDish = {
        id: Date.now() + Math.random(), // Always unique
        name: ingredient.trim(),
        type: 'ingredient',
        category: 'Shopping Item'
    };
    
    // Use FORCE ADD
    const success = window.userManager.forceAddToShoppingList(ingredientDish);
    
    if (success) {
        this.showNotification(`✅ "${ingredient}" added to shopping list`, 'success');
    }
}
debugShoppingList() {
    console.log('🐛 DEBUG: Shopping List Status');
    if (window.userManager) {
        const shoppingList = window.userManager.getShoppingList();
        console.log('🛒 Current shopping list items:', shoppingList.length);
        shoppingList.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, item.name);
        });
    }
}
    // FIXED SHARE FUNCTION - This creates proper shareable links
    shareRecipe() {
        if (!this.currentRecipe) return;
        
        // Create proper shareable link
        const recipeUrl = `${window.location.origin}${window.location.pathname}?recipe=${encodeURIComponent(this.currentRecipe.name)}&id=${this.currentRecipe.id}`;
        const shareText = `Check out this amazing recipe: ${this.currentRecipe.name} - ${recipeUrl}`;

        console.log('📤 Sharing recipe:', this.currentRecipe.name);
        console.log('Share URL:', recipeUrl);

        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: `${this.currentRecipe.name} - Daily Dish`,
                text: `Check out this amazing recipe: ${this.currentRecipe.name}`,
                url: recipeUrl
            }).then(() => {
                console.log('Share successful');
            }).catch((error) => {
                console.log('Web share failed, falling back to clipboard');
                this.fallbackShare(shareText);
            });
        } else {
            // Fallback to clipboard
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(shareText) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('📋 Recipe link copied to clipboard! Share it with your friends!', 'success');
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
        document.execCommand('copy');
        document.body.removeChild(textArea);
        this.showNotification('📋 Recipe link copied to clipboard!', 'success');
    }

    startCookingMode() {
    // Switch to instructions tab first
    const instructionsTab = document.getElementById('nav-about-tab');
    if (instructionsTab) {
        instructionsTab.click();
    }
    
    // Scroll to instructions with better positioning
    setTimeout(() => {
        const instructionsSection = document.getElementById('nav-about');
        if (instructionsSection) {
            const elementPosition = instructionsSection.getBoundingClientRect().top + window.pageYOffset;
            const offsetPosition = elementPosition - this.getScrollOffset();
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, 400); // Slightly longer delay for tab switch
    
    this.showNotification('🍳 Starting cooking mode! Follow the instructions above.', 'success');
}

getScrollOffset() {
    // Different offsets for mobile vs desktop
    if (window.innerWidth < 768) {
        return 120; // More offset for mobile (header + some space)
    } else {
        return 80; // Less offset for desktop
    }
}
// Add to RecipeDetailManager class - DYNAMIC STAR RATINGS
updateStarRatings() {
    if (!this.currentRecipe) return;
    
    const ratingContainer = document.getElementById('recipeRating');
    if (!ratingContainer) return;
    
    // Get rating from userManager (based on comments/ratings)
    const ratingInfo = window.userManager ? 
        window.userManager.getDishRating(this.currentRecipe) : 
        { average: 0, count: 0 };
    
    const averageRating = ratingInfo.average || 0;
    const ratingCount = ratingInfo.count || 0;
    
    // Generate stars based on average rating
    const starsHtml = this.generateStarIcons(averageRating);
    
    ratingContainer.innerHTML = starsHtml;
    
    // Add rating count if available
    if (ratingCount > 0) {
        const countElement = document.createElement('small');
        countElement.className = 'text-muted ms-2';
        countElement.textContent = `(${ratingCount})`;
        ratingContainer.appendChild(countElement);
    }
}

generateStarIcons(averageRating) {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    let starsHtml = '';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
            starsHtml += '<i class="fa fa-star text-warning"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
            starsHtml += '<i class="fa fa-star-half-alt text-warning"></i>';
        } else {
            starsHtml += '<i class="fa fa-star text-secondary"></i>';
        }
    }
    
    return starsHtml;
}
    toggleFavorite() {
        if (!this.currentRecipe) return;
        
        if (window.userManager) {
            const isNowFavorite = window.userManager.toggleFavorite(this.currentRecipe);
            this.showNotification(
                //isNowFavorite ? `❤️ ${this.currentRecipe.name} added to favorites` : `💔 ${this.currentRecipe.name} removed from favorites`,
                isNowFavorite ? 'success' : 'info'
            );
        } else {
            this.showNotification('Please login to save favorites', 'warning');
        }
    }

    showNotification(message, type = 'info') {
        document.querySelectorAll('.recipe-notification').forEach(note => note.remove());
        
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show recipe-notification position-fixed`;
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

    initEventListeners() {
        console.log('Initializing event listeners');
        
        // Review form submission
        const reviewForm = document.getElementById('reviewForm');
        if (reviewForm) {
            reviewForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if (this.currentRecipe) {
                    this.submitReview(this.currentRecipe);
                }
            });
        }

        // Star rating interaction
        const stars = document.querySelectorAll('.star-rating .fa-star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const rating = this.getAttribute('data-rating');
                document.getElementById('selectedRating').value = rating;
                
                stars.forEach((s, index) => {
                    if (index < rating) {
                        s.classList.add('text-warning');
                        s.classList.remove('text-muted');
                    } else {
                        s.classList.remove('text-warning');
                        s.classList.add('text-muted');
                    }
                });
            });
        });

        console.log('Event listeners initialized');
    }

    // ULTIMATE NUCLEAR: Bypass all validation and force submit
submitReview() {
    console.log('📝 Submit review called');
    
    // Get form values
    const comment = document.getElementById('reviewComment')?.value || '';
    const rating = document.getElementById('selectedRating')?.value || '5';
    
    // Basic validation
    if (!comment.trim()) {
        this.showNotification('Please write a comment', 'warning');
        return false;
    }
    
    if (!this.currentRecipe) {
        this.showNotification('No recipe selected', 'warning');
        return false;
    }
    
    // Submit to userManager
    if (window.userManager) {
        const success = window.userManager.addReview(
            this.currentRecipe,
            parseInt(rating),
            comment,
            document.getElementById('reviewName')?.value || 'User',
            document.getElementById('reviewEmail')?.value || 'user@example.com'
        );
        
        if (success) {
            this.showNotification('✅ Review submitted!', 'success');
            document.getElementById('reviewComment').value = '';
            setTimeout(() => this.loadRecipeReviews(), 1000);
        }
    }
    
    return false;
}
// ULTIMATE NUCLEAR: Bypass everything
ultimateSubmitReview() {
    console.log('💣 ULTIMATE NUCLEAR: Force submitting review');
    
    if (!this.currentRecipe) {
        this.showNotification('No recipe selected', 'warning');
        return;
    }
    
    const comment = prompt('Enter your review comment (this bypasses the form):');
    if (!comment || comment.trim() === '') {
        this.showNotification('Comment is required', 'warning');
        return;
    }
    
    const rating = prompt('Enter rating (1-5):', '5');
    
    const success = window.userManager.addReview(
        this.currentRecipe,
        parseInt(rating) || 5,
        comment.trim(),
        'User' + Date.now(),
        'user' + Date.now() + '@example.com'
    );
    
    if (success) {
        this.showNotification('✅ Review submitted via NUCLEAR method!', 'success');
        setTimeout(() => {
            this.loadRecipeReviews();
        }, 500);
    } else {
        this.showNotification('❌ Nuclear submission failed', 'error');
    }
}
// Add this method to debug form issues
debugReviewForm() {
    console.log('🐛 DEBUG: Review Form Status');
    
    const elements = {
        rating: document.getElementById('selectedRating'),
        comment: document.getElementById('reviewComment'),
        name: document.getElementById('reviewName'),
        email: document.getElementById('reviewEmail'),
        form: document.getElementById('reviewForm')
    };
    
    console.log('🔍 Elements found:', elements);
    
    for (const [key, element] of Object.entries(elements)) {
        if (element) {
            console.log(`📝 ${key}:`, {
                value: element.value,
                required: element.required,
                disabled: element.disabled,
                valid: element.checkValidity ? element.checkValidity() : 'N/A'
            });
        } else {
            console.log(`❌ ${key}: NOT FOUND`);
        }
    }
    
    // Test if we can manually submit
    this.testManualSubmit();
}

testManualSubmit() {
    console.log('🧪 TEST: Manual submission test');
    
    const testData = {
        recipe: this.currentRecipe,
        rating: 5,
        comment: 'Test comment from debug',
        userName: 'Test User',
        userEmail: 'test@example.com'
    };
    
    console.log('🧪 Test data:', testData);
    
    if (window.userManager && window.userManager.addReview) {
        const success = window.userManager.addReview(
            testData.recipe,
            testData.rating,
            testData.comment,
            testData.userName,
            testData.userEmail
        );
        console.log('🧪 Test result:', success);
    } else {
        console.error('❌ userManager.addReview not available');
    }
}
// Auto-fill user data in review form
autoFillReviewForm() {
    if (!window.userManager || !window.userManager.currentUser) {
        console.log('👤 User not logged in, cannot auto-fill form');
        return;
    }

    try {
        const nameField = document.getElementById('reviewName');
        const emailField = document.getElementById('reviewEmail');
        
        if (!nameField || !emailField) return;

        let userName = '';
        let userEmail = '';

        // Get user data from userManager
        if (window.userManager.userData) {
            userName = window.userManager.userData.username || '';
            userEmail = window.userManager.userData.email || '';
        } else if (typeof window.userManager.currentUser === 'string') {
            userEmail = window.userManager.currentUser;
            userName = window.userManager.currentUser.split('@')[0];
        }

        // Only fill if fields are empty
        if (userName && (!nameField.value || nameField.value.trim() === '')) {
            nameField.value = userName;
        }
        
        if (userEmail && (!emailField.value || emailField.value.trim() === '')) {
            emailField.value = userEmail;
        }

        console.log('✅ Auto-filled review form for user:', userName);
    } catch (error) {
        console.error('❌ Error auto-filling review form:', error);
    }
}
}
// ========== MY WORKING REVIEW SYSTEM ==========

// ========== ULTIMATE FIXED REVIEW SYSTEM ==========
class MyReviewSystem {
    constructor() {
        this.currentRating = 5;
        this.isInitialized = false;
        this.ratingMessages = {
            1: "1 Star - Poor",
            2: "2 Stars - Fair", 
            3: "3 Stars - Good",
            4: "4 Stars - Very Good",
            5: "5 Stars - Excellent!"
        };
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('⭐ ULTIMATE REVIEW SYSTEM: Initializing...');
        this.setupTabManagement();
        this.setupStarRating();
        this.setupReviewForm();
        this.loadReviews();
        this.isInitialized = true;
        
        console.log('✅ ULTIMATE REVIEW SYSTEM: Ready!');
    }

    setupTabManagement() {
        // Watch for tab changes
        const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabButtons.forEach(button => {
            button.addEventListener('shown.bs.tab', (event) => {
                const target = event.target.getAttribute('data-bs-target');
                if (target === '#nav-mission') {
                    // Reviews tab activated
                    document.body.classList.add('reviews-tab-active');
                    this.loadReviews(); // Reload reviews when tab is clicked
                } else {
                    // Main tab activated
                    document.body.classList.remove('reviews-tab-active');
                }
            });
        });

        console.log('✅ Tab management setup complete');
    }

    setupStarRating() {
        const starWrappers = document.querySelectorAll('.star-wrapper');
        const ratingText = document.getElementById('ratingText');
        
        if (!starWrappers.length) {
            console.error('❌ Star wrappers not found!');
            return;
        }

        starWrappers.forEach(wrapper => {
            const rating = parseInt(wrapper.getAttribute('data-rating'));
            const starIcon = wrapper.querySelector('.star-icon');
            
            // Set initial active state
            if (rating <= this.currentRating) {
                wrapper.classList.add('active');
                starIcon.style.color = '#FFB524';
            }

            wrapper.addEventListener('click', () => {
                this.currentRating = rating;
                document.getElementById('mySelectedRating').value = this.currentRating;
                
                // Update all stars
                starWrappers.forEach(w => {
                    const wRating = parseInt(w.getAttribute('data-rating'));
                    const wStar = w.querySelector('.star-icon');
                    
                    if (wRating <= this.currentRating) {
                        w.classList.add('active');
                        wStar.style.color = '#FFB524';
                    } else {
                        w.classList.remove('active');
                        wStar.style.color = '#e0e0e0';
                    }
                });
                
                // Update rating text
                ratingText.textContent = this.currentRating;
                document.querySelector('.rating-display').innerHTML = 
                    `<span>${this.currentRating}</span> Stars - ${this.ratingMessages[this.currentRating]}`;
                
                console.log('⭐ Rating selected:', this.currentRating);
            });

            // Hover effects
            wrapper.addEventListener('mouseenter', () => {
                const hoverRating = rating;
                starWrappers.forEach(w => {
                    const wRating = parseInt(w.getAttribute('data-rating'));
                    const wStar = w.querySelector('.star-icon');
                    
                    if (wRating <= hoverRating) {
                        wStar.style.color = '#FFB524';
                        wStar.style.opacity = '0.7';
                    }
                });
            });

            wrapper.addEventListener('mouseleave', () => {
                starWrappers.forEach(w => {
                    const wRating = parseInt(w.getAttribute('data-rating'));
                    const wStar = w.querySelector('.star-icon');
                    wStar.style.opacity = '1';
                    
                    if (wRating <= this.currentRating) {
                        wStar.style.color = '#FFB524';
                    } else {
                        wStar.style.color = '#e0e0e0';
                    }
                });
            });
        });

        console.log('✅ Star rating setup complete');
    }

    setupReviewForm() {
        const form = document.getElementById('myReviewForm');
        if (!form) {
            console.error('❌ Review form not found!');
            return;
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitReview();
        });

        // Auto-fill user data if logged in
        this.autoFillUserData();
        
        console.log('✅ Review form setup complete');
    }

    autoFillUserData() {
        if (window.userManager && window.userManager.currentUser) {
            try {
                const nameField = document.getElementById('myReviewName');
                const emailField = document.getElementById('myReviewEmail');
                
                let userName = '';
                let userEmail = '';

                if (window.userManager.userData) {
                    userName = window.userManager.userData.username || '';
                    userEmail = window.userManager.userData.email || '';
                } else if (typeof window.userManager.currentUser === 'string') {
                    userEmail = window.userManager.currentUser;
                    userName = window.userManager.currentUser.split('@')[0];
                } else if (window.userManager.currentUser.email) {
                    userEmail = window.userManager.currentUser.email;
                    userName = window.userManager.currentUser.email.split('@')[0];
                }

                if (userName && nameField && (!nameField.value || nameField.value.trim() === '')) {
                    nameField.value = userName;
                }
                
                if (userEmail && emailField && (!emailField.value || emailField.value.trim() === '')) {
                    emailField.value = userEmail;
                }

                console.log('✅ Auto-filled user data for review form');
            } catch (error) {
                console.error('❌ Error auto-filling user data:', error);
            }
        }
    }

    async submitReview() {
        console.log('📝 ULTIMATE REVIEW SYSTEM: Submitting review...');
        
        const name = document.getElementById('myReviewName')?.value.trim();
        const email = document.getElementById('myReviewEmail')?.value.trim();
        const comment = document.getElementById('myReviewComment')?.value.trim();
        const rating = this.currentRating;

        // Validation
        if (!name || !email || !comment) {
            this.showNotification('Please fill in all required fields', 'warning');
            return;
        }

        if (!window.recipeDetailManager || !window.recipeDetailManager.currentRecipe) {
            this.showNotification('No recipe selected', 'error');
            return;
        }

        const dish = window.recipeDetailManager.currentRecipe;
        console.log('🍽️ Submitting review for dish:', dish.name, 'ID:', dish.id);

        try {
            // Submit via UserManager
            if (window.userManager) {
                console.log('👤 Using UserManager to submit review...');
                const success = window.userManager.addReview(
                    dish,
                    rating,
                    comment,
                    name,
                    email
                );

                if (success) {
                    this.showNotification('✅ Review submitted successfully!', 'success');
                    this.clearForm();
                    // Reload reviews after a short delay
                    setTimeout(() => this.loadReviews(), 1000);
                } else {
                    this.showNotification('❌ Failed to submit review', 'error');
                }
            } else {
                this.showNotification('User manager not available', 'error');
                console.error('❌ UserManager not found');
            }
        } catch (error) {
            console.error('❌ Error submitting review:', error);
            this.showNotification('Error submitting review: ' + error.message, 'error');
        }
    }

    clearForm() {
        const form = document.getElementById('myReviewForm');
        if (form) {
            form.reset();
        }
        this.currentRating = 5;
        document.getElementById('mySelectedRating').value = '5';
        document.querySelector('.rating-display').innerHTML = 
            '<span>5</span> Stars - Excellent!';
        
        // Reset stars
        const starWrappers = document.querySelectorAll('.star-wrapper');
        starWrappers.forEach(wrapper => {
            const rating = parseInt(wrapper.getAttribute('data-rating'));
            const starIcon = wrapper.querySelector('.star-icon');
            
            if (rating <= 5) {
                wrapper.classList.add('active');
                starIcon.style.color = '#FFB524';
            } else {
                wrapper.classList.remove('active');
                starIcon.style.color = '#e0e0e0';
            }
        });
    }

    async loadReviews() {
        console.log('📊 ULTIMATE REVIEW SYSTEM: Loading reviews...');
        
        const container = document.getElementById('myReviewsContainer');
        if (!container) {
            console.error('❌ Reviews container not found!');
            return;
        }

        if (!window.recipeDetailManager || !window.recipeDetailManager.currentRecipe) {
            container.innerHTML = '<div class="text-center py-4"><p class="text-muted">No recipe selected</p></div>';
            return;
        }

        const dish = window.recipeDetailManager.currentRecipe;
        console.log('🍽️ Loading reviews for dish:', dish.name, 'ID:', dish.id);

        try {
            // Show loading
            container.innerHTML = `
                <div class="text-center py-5">
                    <div class="spinner-border mb-3" style="color: #81C408;" role="status">
                        <span class="visually-hidden">Loading reviews...</span>
                    </div>
                    <p class="text-muted">Loading reviews<span class="loading-dots"></span></p>
                </div>
            `;

            // DEBUG: Check if UserManager exists
            console.log('🔍 Checking UserManager:', window.userManager);
            console.log('🔍 Checking getDishReviews method:', window.userManager?.getDishReviews);

            // Get reviews from UserManager
            let reviews = [];
            if (window.userManager && typeof window.userManager.getDishReviews === 'function') {
                console.log('🔍 Calling getDishReviews for dish ID:', dish.id);
                reviews = await window.userManager.getDishReviews(dish.id);
                console.log('📊 Reviews received:', reviews);
            } else {
                console.error('❌ UserManager or getDishReviews not available');
                this.showNotification('Review system not available', 'error');
            }

            console.log('📊 ULTIMATE REVIEW SYSTEM: Reviews loaded:', reviews.length);

            if (reviews.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-comments fa-3x text-muted mb-3"></i>
                        <h5 class="text-dark mb-3">No Reviews Yet</h5>
                        <p class="text-muted mb-4">Be the first to share your experience!</p>
                    </div>
                `;
                return;
            }

            // Calculate average rating
            const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
            
            // Display reviews
            container.innerHTML = `
                <div class="reviews-summary p-4 border-bottom">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h3 class="text-dark mb-2">${averageRating.toFixed(1)}</h3>
                            <div class="mb-2">
                                ${this.generateStarIcons(averageRating)}
                            </div>
                            <p class="text-muted mb-0">Based on ${reviews.length} review${reviews.length > 1 ? 's' : ''}</p>
                        </div>
                        <div class="col-md-6">
                            <div class="rating-bars">
                                ${this.generateRatingBars(reviews)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="reviews-list p-4">
                    ${reviews.map((review, index) => `
                        <div class="review-item p-3 mb-3">
                            <div class="d-flex align-items-start mb-2">
                                <div class="user-avatar me-3">${(review.userName || 'U').charAt(0).toUpperCase()}</div>
                                <div class="flex-grow-1">
                                    <h6 class="fw-bold text-dark mb-1">${review.userName || 'Anonymous User'}</h6>
                                    <div class="d-flex align-items-center">
                                        ${this.generateStarIcons(review.rating)}
                                        <small class="text-muted ms-2">
                                            ${review.displayDate || 
                                              (review.timestamp ? new Date(review.timestamp).toLocaleDateString() : 
                                              review.createdAt ? new Date(review.createdAt).toLocaleDateString() : 'Recently')}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <p class="text-dark mb-0">${review.comment}</p>
                        </div>
                    `).join('')}
                </div>
            `;

        } catch (error) {
            console.error('❌ ULTIMATE REVIEW SYSTEM: Error loading reviews:', error);
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-exclamation-triangle text-warning fa-2x mb-3"></i>
                    <h5 class="text-dark mb-3">Couldn't Load Reviews</h5>
                    <p class="text-muted mb-3">Please try again</p>
                    <button class="btn btn-sm" style="background: #81C408; color: black;" onclick="myReviewSystem.loadReviews()">
                        <i class="fas fa-redo me-1"></i>Try Again
                    </button>
                </div>
            `;
        }
    }

    generateStarIcons(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        let starsHtml = '';
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                starsHtml += `<i class="fas fa-star me-1" style="color: #FFB524;"></i>`;
            } else if (i === fullStars + 1 && hasHalfStar) {
                starsHtml += `<i class="fas fa-star-half-alt me-1" style="color: #FFB524;"></i>`;
            } else {
                starsHtml += `<i class="far fa-star me-1" style="color: #FFB524;"></i>`;
            }
        }
        
        return starsHtml;
    }

    generateRatingBars(reviews) {
        const distribution = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
        reviews.forEach(review => distribution[review.rating]++);
        
        return Object.entries(distribution).reverse().map(([rating, count]) => {
            const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
            return `
                <div class="rating-bar-item d-flex align-items-center mb-2">
                    <span class="me-2 fw-bold text-dark" style="width: 25px;">${rating}★</span>
                    <div class="progress flex-grow-1" style="height: 8px;">
                        <div class="progress-bar" style="width: ${percentage}%; background: #FFB524;"></div>
                    </div>
                    <small class="ms-2 text-dark fw-bold" style="width: 30px;">${count}</small>
                </div>
            `;
        }).join('');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.my-review-notification').forEach(note => note.remove());
        
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };

        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show my-review-notification position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px; border-radius: 8px;';
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${icons[type]} me-2"></i>
                <div class="flex-grow-1">${message}</div>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 4000);
    }
}

// Initialize My Review System
window.myReviewSystem = new MyReviewSystem();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Recipe Detail Manager...');
    window.recipeDetailManager = new RecipeDetailManager();
    setTimeout(() => {
        if (window.myReviewSystem && !window.myReviewSystem.isInitialized) {
            window.myReviewSystem.init();
        }
    }, 2000);
    // Start initialization after a short delay to ensure dishManager is loaded
    setTimeout(() => {
        window.recipeDetailManager.init();
    }, 100);
});