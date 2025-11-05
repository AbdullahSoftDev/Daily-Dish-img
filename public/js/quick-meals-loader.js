// quick-meals-loader.js - Only replaces content, keeps carousel structure
class QuickMealsLoader {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadQuickMeals();
    }

    async loadQuickMeals() {
        try {
            let dishes = [];
            
            // Try to get dishes from dishManager first
            if (window.dishManager && window.dishManager.isLoaded) {
                dishes = window.dishManager.getAllDishes();
            } else {
                // Fallback: Load directly from dishes.json
                const response = await fetch('data/dishes.json');
                const data = await response.json();
                dishes = Object.values(data).flat();
            }

            // Get 8 random quick meals (dishes with shorter cook times)
            const quickMeals = this.getRandomQuickMeals(dishes, 8);
            this.updateCarousel(quickMeals);
            
        } catch (error) {
            console.error('❌ Error loading quick meals:', error);
            // If error occurs, keep the original carousel items
        }
    }

    getRandomQuickMeals(dishes, count) {
        // Filter for quick meals (45 mins or less)
        const quickMeals = dishes.filter(dish => {
            const cookTime = parseInt(dish.cookTime) || 60;
            return cookTime <= 45;
        });

        // If not enough quick meals, use any random dishes
        if (quickMeals.length < count) {
            const shuffled = [...dishes].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        // Get random quick meals
        const shuffled = [...quickMeals].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    updateCarousel(meals) {
        const carousel = document.querySelector('.vegetable-carousel');
        if (!carousel || meals.length === 0) return;

        // Create new carousel items
        const newItems = meals.map(meal => this.createCarouselItem(meal)).join('');
        
        // Replace content but keep the carousel structure
        carousel.innerHTML = newItems;

        // Reinitialize the carousel to maintain navigation arrows
        this.reinitCarousel();
    }

    createCarouselItem(meal) {
        const typeClass = meal.type === 'veg' ? 'bg-success' : 'bg-primary';
        const typeText = meal.type === 'veg' ? 'Veg' : 
                        meal.type === 'non-veg' ? 'Non-Veg' : 
                        meal.type === 'sea-food' ? 'Sea Food' : 'Quick Meal';

        return `
            <div class="border border-primary rounded position-relative vesitable-item">
                <div class="vesitable-img">
                    <img src="${meal.image || 'img/vegetable-item-6.webp'}" class="img-fluid w-100 rounded-top" alt="${meal.name}" style="height: 200px; object-fit: cover;">
                </div>
                <div class="text-white ${typeClass} px-3 py-1 rounded position-absolute" style="top: 10px; right: 10px;">${typeText}</div>
                <div class="p-4 rounded-bottom">
                    <h4>${meal.name}</h4>
                    <p>${meal.category || 'Quick & delicious meal'}</p>
                    <div class="d-flex justify-content-between flex-lg-wrap">
                        <p class="text-dark fs-5 fw-bold mb-0">${meal.cookTime || '30 mins'}</p>
                        <a href="shop-detail.html?id=${meal.id}" class="btn border border-secondary rounded-pill px-3 text-primary">
                            <i class="fa fa-shopping-bag me-2 text-primary"></i> View Recipe
                        </a>
                    </div>
                </div>
            </div>
        `;
    }

    reinitCarousel() {
        // Reinitialize Owl Carousel to maintain navigation arrows
        if (typeof jQuery !== 'undefined' && jQuery().owlCarousel) {
            $(".vegetable-carousel").owlCarousel({
                autoplay: true,
                smartSpeed: 1500,
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
                    576: { items: 1 },
                    768: { items: 2 },
                    992: { items: 3 },
                    1200: { items: 4 }
                }
            });
        }
    }
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    new QuickMealsLoader();
});