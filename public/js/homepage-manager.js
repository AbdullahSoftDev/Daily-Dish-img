// homepage-manager.js - Complete homepage functionality
class HomepageManager {
    constructor() {
        this.dishes = [];
        this.init();
    }

    async init() {
        console.log('🏠 Homepage Manager Initializing...');
        await this.loadDishes();
        this.setupSearch();
        this.setupCategoryTabs();
        this.loadAllSections();
    }

    async loadDishes() {
        try {
            // Wait for dishManager to be ready
            if (window.dishManager) {
                await window.dishManager.loadDishes();
                this.dishes = window.dishManager.getAllDishes();
            } else {
                // Fallback direct load
                const response = await fetch('data/dishes.json');
                const data = await response.json();
                this.dishes = Object.values(data).flat();
            }
            console.log(`✅ Loaded ${this.dishes.length} dishes for homepage`);
        } catch (error) {
            console.error('❌ Error loading dishes:', error);
            this.dishes = [];
        }
    }

    setupSearch() {
    // Hero search
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // Also add click event for the button
        const heroSearchBtn = document.querySelector('[onclick="performSearch()"]');
        if (heroSearchBtn) {
            heroSearchBtn.addEventListener('click', () => this.performSearch());
        }
    }

    // Modal search
    const searchInput = document.getElementById('searchInput');
    const searchIcon = document.getElementById('search-icon-1');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performModalSearch();
            }
        });
    }
    
    if (searchIcon) {
        searchIcon.addEventListener('click', () => this.performModalSearch());
    }
}


    async performSearch() {
    const searchTerm = document.getElementById('heroSearch')?.value.trim();
    if (searchTerm) {
        await this.searchAndNavigate(searchTerm);
    } else {
        window.location.href = 'shop.html';
    }
}

    async performModalSearch() {
    const searchTerm = document.getElementById('searchInput')?.value.trim();
    if (searchTerm) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (modal) modal.hide();
        await this.searchAndNavigate(searchTerm);
    }
}
async searchAndNavigate(searchTerm) {
    try {
        console.log('🔍 ULTIMATE SEARCH FIX: Searching for:', searchTerm);
        
        if (!searchTerm.trim()) {
            window.location.href = 'shop.html';
            return;
        }

        let results = [];
        
        // METHOD 1: Use dishManager (most reliable)
        if (window.dishManager && window.dishManager.isLoaded) {
            console.log('🔍 Using dishManager search');
            results = window.dishManager.searchDishes(searchTerm);
        } 
        // METHOD 2: Direct JSON fetch
        else {
            console.log('🔍 Using direct JSON fetch');
            results = await this.directSearch(searchTerm);
        }
        
        console.log(`✅ Found ${results.length} dishes matching "${searchTerm}"`);

        // Store results for shop.html
        if (results.length > 0) {
            sessionStorage.setItem('searchResults', JSON.stringify({
                term: searchTerm,
                results: results.slice(0, 50),
                timestamp: Date.now()
            }));
            console.log('💾 Search results stored in sessionStorage');
        }

        // Navigate to shop page
        const searchUrl = `shop.html?search=${encodeURIComponent(searchTerm)}`;
        console.log('🚀 Navigating to:', searchUrl);
        window.location.href = searchUrl;
        
    } catch (error) {
        console.error('❌ Search error:', error);
        // Ultimate fallback
        window.location.href = `shop.html?search=${encodeURIComponent(searchTerm)}`;
    }
}
// NEW: Direct search from dishes.json
async directSearch(searchTerm) {
    try {
        console.log('📁 Loading dishes.json directly...');
        const response = await fetch('data/dishes.json');
        if (!response.ok) throw new Error('Failed to fetch dishes.json');
        
        const dishesData = await response.json();
        const allDishes = Object.values(dishesData).flat();
        
        const term = searchTerm.toLowerCase();
        return allDishes.filter(dish => {
            if (!dish) return false;
            
            // Search in multiple fields
            const nameMatch = dish.name && dish.name.toLowerCase().includes(term);
            const categoryMatch = dish.category && dish.category.toLowerCase().includes(term);
            const cuisineMatch = dish.cuisine && dish.cuisine.toLowerCase().includes(term);
            const ingredientMatch = dish.ingredients && 
                dish.ingredients.some(ing => ing && ing.toLowerCase().includes(term));
            const tagMatch = dish.tags && 
                dish.tags.some(tag => tag && tag.toLowerCase().includes(term));
                
            return nameMatch || categoryMatch || cuisineMatch || ingredientMatch || tagMatch;
        });
    } catch (error) {
        console.error('❌ Direct search failed:', error);
        return [];
    }
}

searchInDishes(searchTerm) {
    if (!searchTerm || !this.dishes.length) return [];
    
    const term = searchTerm.toLowerCase();
    
    return this.dishes.filter(dish => {
        if (!dish) return false;
        
        // Search in name
        if (dish.name && dish.name.toLowerCase().includes(term)) return true;
        
        // Search in category
        if (dish.category && dish.category.toLowerCase().includes(term)) return true;
        
        // Search in cuisine
        if (dish.cuisine && dish.cuisine.toLowerCase().includes(term)) return true;
        
        // Search in ingredients
        if (dish.ingredients && Array.isArray(dish.ingredients)) {
            return dish.ingredients.some(ingredient => 
                ingredient && ingredient.toLowerCase().includes(term)
            );
        }
        
        // Search in description/tags
        if (dish.tags && Array.isArray(dish.tags)) {
            return dish.tags.some(tag => 
                tag && tag.toLowerCase().includes(term)
            );
        }
        
        return false;
    });
}

// Add notification method
showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.search-notification').forEach(note => note.remove());
    
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show search-notification position-fixed`;
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
    }, 4000);
}
// Add this method to HomepageManager class
handleTabClick(category) {
    console.log('🔄 Tab clicked:', category);
    
    // Remove active class from all tabs
    document.querySelectorAll('.homepage-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Add active class to clicked tab
    event.target.closest('.homepage-tab').classList.add('active');
    
    // Handle the content change
    switch(category) {
        case 'veg':
            this.loadVegDishes();
            break;
        case 'non-veg':
            this.loadNonVegDishes();
            break;
        case 'sea-food':
            this.loadSeafoodDishes();
            break;
        default:
            this.loadTodaysRecommendation();
    }
    
    // Manually show the tab content without Bootstrap's default behavior
    this.activateTabContent(category);
}

activateTabContent(category) {
    const tabMap = {
        'veg': 'tab-2',
        'non-veg': 'tab-3', 
        'sea-food': 'tab-5'
    };
    
    // Hide all tab contents
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    
    // Show the selected tab content
    const targetTab = tabMap[category];
    if (targetTab) {
        const tabPane = document.getElementById(targetTab);
        if (tabPane) {
            tabPane.classList.add('show', 'active');
        }
    }
}

// Update the setupCategoryTabs method:
setupCategoryTabs() {
    // Remove any existing Bootstrap tab event listeners
    document.querySelectorAll('[data-bs-toggle="pill"]').forEach(tab => {
        tab.setAttribute('data-bs-toggle', '');
    });
    
    console.log('✅ Tab scrolling prevention applied');
}
    // In the setupCategoryTabs method, replace with this:

// Update the handleTabChange method:
handleTabChange(target) {
    console.log('🔄 Tab changed to:', target);
    
    switch(target) {
        case '#tab-2':
            this.loadVegDishes();
            break;
        case '#tab-3':
            this.loadNonVegDishes();
            break;
        case '#tab-5':
            this.loadSeafoodDishes();
            break;
        default:
            // For tab-1 (Today's Recommendation), ensure it's loaded
            if (target === '#tab-1') {
                this.loadTodaysRecommendation();
            }
    }
}

    loadAllSections() {
        this.loadTodaysRecommendation();
        this.loadQuickMeals();
    }

    // Get random dishes
    getRandomDishes(count = 8, filter = null) {
        let filteredDishes = this.dishes;
        
        if (filter) {
            filteredDishes = this.dishes.filter(dish => {
                if (filter === 'veg') return dish.type === 'veg';
                if (filter === 'non-veg') return dish.type === 'non-veg';
                if (filter === 'sea-food') return dish.type === 'sea-food' || dish.category?.toLowerCase().includes('sea') || dish.category?.toLowerCase().includes('fish');
                return true;
            });
        }

        // Shuffle and take requested count
        const shuffled = [...filteredDishes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Today's Recommendation - Random dishes
    loadTodaysRecommendation() {
        const container = document.querySelector('#tab-1 .row.g-4');
        if (!container) {
            console.error('❌ Today\'s recommendation container not found');
            return;
        }

        const randomDishes = this.getRandomDishes(8);
        
        if (randomDishes.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><p>No dishes available</p></div>';
            return;
        }

        const dishesHtml = randomDishes.map(dish => this.createDishCard(dish)).join('');
        container.innerHTML = `
            <div class="col-lg-12">
                <div class="row g-4">
                    ${dishesHtml}
                </div>
            </div>
        `;
    }

    // Quick Meals - Keep your perfect carousel structure but replace content
    loadQuickMeals() {
    const carousel = document.querySelector('.vegetable-carousel');
    if (!carousel) {
        console.error('❌ Quick meals carousel not found');
        return;
    }

    // Get quick meals (dishes with shorter cook times)
    const quickMeals = this.dishes.filter(dish => {
        const cookTime = parseInt(dish.cookTime) || 60;
        return cookTime <= 45; // 45 minutes or less
    });

    const randomQuickMeals = this.getRandomDishes(8, null, quickMeals);
    
    if (randomQuickMeals.length === 0) {
        console.log('⚠️ No quick meals found, using random dishes');
        const randomQuickMeals = this.getRandomDishes(8);
    }

    // Create new carousel items with equal height structure
    const newItems = randomQuickMeals.map(meal => this.createCarouselItem(meal)).join('');
    
    // Replace content
    carousel.innerHTML = newItems;

    // Reinitialize the carousel
    setTimeout(() => {
        this.reinitCarousel();
    }, 100);
}

    // Veg dishes
    loadVegDishes() {
        const container = document.querySelector('#tab-2 .row.g-4');
        if (!container) return;

        const vegDishes = this.getRandomDishes(8, 'veg');
        const dishesHtml = vegDishes.map(dish => this.createDishCard(dish)).join('');
        
        container.innerHTML = `
            <div class="col-lg-12">
                <div class="row g-4">
                    ${dishesHtml}
                </div>
            </div>
        `;
    }

    // Non-veg dishes
    loadNonVegDishes() {
        const container = document.querySelector('#tab-3 .row.g-4');
        if (!container) return;

        const nonVegDishes = this.getRandomDishes(8, 'non-veg');
        const dishesHtml = nonVegDishes.map(dish => this.createDishCard(dish)).join('');
        
        container.innerHTML = `
            <div class="col-lg-12">
                <div class="row g-4">
                    ${dishesHtml}
                </div>
            </div>
        `;
    }

    // Seafood dishes
    loadSeafoodDishes() {
        const container = document.querySelector('#tab-5 .row.g-4');
        if (!container) return;

        const seafoodDishes = this.getRandomDishes(8, 'sea-food');
        const dishesHtml = seafoodDishes.map(dish => this.createDishCard(dish)).join('');
        
        container.innerHTML = `
            <div class="col-lg-12">
                <div class="row g-4">
                    ${dishesHtml}
                </div>
            </div>
        `;
    }

    // Create dish card for Today's Recommendation and category tabs
    createDishCard(dish) {
        const typeClass = dish.type === 'veg' ? 'bg-success' : 'bg-secondary';
        const typeText = dish.type === 'veg' ? 'Veg' : 
                        dish.type === 'non-veg' ? 'Non-Veg' : 
                        dish.type === 'sea-food' ? 'Sea Food' : 'Dish';

        return `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="rounded position-relative fruite-item">
                    <div class="fruite-img">
                        <img src="${dish.image || 'img/fruite-item-5.webp'}" class="img-fluid w-100 rounded-top" alt="${dish.name}" loading="lazy"  <!-- ADD THIS --> style="height: 200px; object-fit: cover;">
                    </div>
                    <div class="text-white ${typeClass} px-3 py-1 rounded position-absolute" style="top: 10px; left: 10px;">${typeText}</div>
                    <div class="p-4 border border-secondary border-top-0 rounded-bottom">
                        <h4>${dish.name}</h4>
                        <p>${dish.category || 'Delicious dish'}</p>
                        <div class="d-flex justify-content-between flex-lg-wrap">
                            <a href="shop-detail.html?id=${dish.id}" class="btn border border-secondary rounded-pill px-3 text-primary">
                                <i class="fa fa-shopping-bag me-2 text-primary"></i> Cook-Time: ${dish.cookTime || '30-40 mins'}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Create quick meal card for carousel
    loadQuickMeals() {
    const carousel = document.querySelector('.vegetable-carousel');
    if (!carousel) {
        console.error('❌ Quick meals carousel not found');
        return;
    }

    // Get quick meals (dishes with shorter cook times)
    const quickMeals = this.dishes.filter(dish => {
        const cookTime = parseInt(dish.cookTime) || 60;
        return cookTime <= 45; // 45 minutes or less
    });

    const randomQuickMeals = this.getRandomDishes(8, null, quickMeals);
    
    if (randomQuickMeals.length === 0) {
        console.log('⚠️ No quick meals found, using random dishes');
        const randomQuickMeals = this.getRandomDishes(8);
    }

    // Create new carousel items with equal height structure
    const newItems = randomQuickMeals.map(meal => this.createCarouselItem(meal)).join('');
    
    // Replace content
    carousel.innerHTML = newItems;

    // Reinitialize the carousel
    setTimeout(() => {
        this.reinitCarousel();
    }, 100);
}

createCarouselItem(meal) {
    const typeClass = meal.type === 'veg' ? 'bg-success' : 'bg-primary';
    const typeText = meal.type === 'veg' ? 'Veg' : 
                    meal.type === 'non-veg' ? 'Non-Veg' : 
                    meal.type === 'sea-food' ? 'Sea Food' : 'Quick Meal';

    return `
        <div class="border border-primary rounded position-relative vesitable-item">
            <div class="vesitable-img">
                <img src="${meal.image || 'img/vegetable-item-6.webp'}" 
                     class="img-fluid w-100 rounded-top" 
                     alt="${meal.name}" 
                     loading="lazy"  <!-- ADD THIS -->
                     onerror="this.src='img/vegetable-item-6.webp'">
            </div>
            <div class="text-white ${typeClass} px-3 py-1 rounded position-absolute" style="top: 10px; right: 10px;">${typeText}</div>
            <div class="p-4 rounded-bottom d-flex flex-column h-100">
                <h4 class="mb-2">${meal.name}</h4>
                <p class="text-muted mb-3 flex-grow-1">${meal.category || 'Quick & delicious meal'}</p>
                <div class="d-flex justify-content-between flex-lg-wrap mt-auto">
                    <span class="text-dark fs-5 fw-bold mb-0">${meal.cookTime || '30 mins'}</span>
                    <a href="shop-detail.html?id=${meal.id}" class="btn border border-secondary rounded-pill px-3 text-primary">
                        <i class="fa fa-shopping-bag me-2 text-primary"></i> View Recipe
                    </a>
                </div>
            </div>
        </div>
    `;
}
// Add this helper method
matchHeights() {
    const carouselItems = document.querySelectorAll('.vesitable-item');
    if (carouselItems.length === 0) return;
    
    let maxHeight = 0;
    
    // Reset heights first
    carouselItems.forEach(item => {
        item.style.height = 'auto';
    });
    
    // Find max height
    carouselItems.forEach(item => {
        const height = item.offsetHeight;
        if (height > maxHeight) maxHeight = height;
    });
    
    // Apply max height to all
    if (maxHeight > 0) {
        carouselItems.forEach(item => {
            item.style.height = maxHeight + 'px';
        });
    }
}
reinitCarousel() {
    console.log('🔄 Reinitializing carousel...');
    
    if (typeof jQuery !== 'undefined' && jQuery().owlCarousel) {
        const $carousel = $(".vegetable-carousel");
        
        // Destroy existing carousel if it exists
        if ($carousel.hasClass('owl-loaded')) {
            $carousel.trigger('destroy.owl.carousel');
            $carousel.removeClass('owl-loaded owl-hidden');
        }

        // Define the function BEFORE using it in callbacks
        const setCarouselEqualHeights = () => {
            const $items = $carousel.find('.vesitable-item');
            if ($items.length === 0) return;
            
            let maxHeight = 0;
            
            // Reset heights first
            $items.css('height', 'auto');
            
            // Find the maximum height
            $items.each(function() {
                const height = $(this).outerHeight();
                if (height > maxHeight) maxHeight = height;
            });
            
            // Apply the maximum height to all items
            if (maxHeight > 0) {
                $items.css('height', maxHeight + 'px');
            }
            
            console.log('📏 Carousel items set to equal height:', maxHeight);
        };

        // Reinitialize with proper settings
        $carousel.owlCarousel({
            autoplay: true,
            smartSpeed: 1000,
            center: false,
            dots: true,
            loop: true,
            margin: 25,
            nav: true,
            navText: [
                '<i class="bi bi-arrow-left"></i>',
                '<i class="bi bi-arrow-right"></i>'
            ],
            responsiveClass: true,
            responsive: {
                0: { items: 1 },
                576: { items: 2 },
                768: { items: 3 },
                992: { items: 4 },
                1200: { items: 4 }
            },
            onInitialized: function() {
                console.log('✅ Carousel initialized, setting equal heights');
                setCarouselEqualHeights();
            },
            onResized: function() {
                setCarouselEqualHeights();
            },
            onTranslated: function() {
                setCarouselEqualHeights();
            }
        });
        
    } else {
        console.error('❌ jQuery or Owl Carousel not available');
    }
}
}

// Wait for everything to load before initializing
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.homepageManager = new HomepageManager();
    }, 500);
});

// Global function for the search button
function performSearch() {
    let searchTerm = '';
    
    // Check hero search first
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch && heroSearch.value.trim()) {
        searchTerm = heroSearch.value.trim();
    } 
    // Check modal search
    else {
        const modalSearch = document.getElementById('searchInput');
        if (modalSearch && modalSearch.value.trim()) {
            searchTerm = modalSearch.value.trim();
        }
    }
    
    if (searchTerm) {
        this.searchAndNavigate(searchTerm);
    } else {
        window.location.href = 'shop.html';
    }
}
function performModalSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput && searchInput.value.trim()) {
        const modal = bootstrap.Modal.getInstance(document.getElementById('searchModal'));
        if (modal) modal.hide();
        this.searchAndNavigate(searchInput.value.trim());
    }
}