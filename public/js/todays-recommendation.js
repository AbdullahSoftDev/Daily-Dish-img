// todays-recommendation.js - Replaces today's recommendation dishes
class TodaysRecommendation {
    constructor() {
        this.init();
    }

    async init() {
        await this.loadTodaysRecommendation();
    }

    async loadTodaysRecommendation() {
        try {
            let dishes = [];
            
            if (window.dishManager && window.dishManager.isLoaded) {
                dishes = window.dishManager.getAllDishes();
            } else {
                const response = await fetch('data/dishes.json');
                const data = await response.json();
                dishes = Object.values(data).flat();
            }

            // Get 8 random dishes for today's recommendation
            const randomDishes = this.getRandomDishes(dishes, 8);
            this.updateRecommendation(randomDishes);
            
        } catch (error) {
            console.error('❌ Error loading today\'s recommendation:', error);
            // Keep the original dishes if error occurs
        }
    }

    getRandomDishes(dishes, count) {
        const shuffled = [...dishes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    updateRecommendation(dishes) {
        const container = document.getElementById('todaysRecommendation');
        if (!container || dishes.length === 0) return;

        const newContent = dishes.map(dish => this.createDishCard(dish)).join('');
        container.innerHTML = newContent;
    }

    createDishCard(dish) {
        const typeClass = dish.type === 'veg' ? 'bg-success' : 'bg-secondary';
        const typeText = dish.type === 'veg' ? 'Veg' : 
                        dish.type === 'non-veg' ? 'Non-Veg' : 
                        dish.type === 'sea-food' ? 'Sea Food' : 'Dish';

        return `
            <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="rounded position-relative fruite-item">
                    <div class="fruite-img">
                        <img src="${dish.image || 'img/fruite-item-5.webp'}" class="img-fluid w-100 rounded-top" alt="${dish.name}" style="height: 200px; object-fit: cover;">
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
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    new TodaysRecommendation();
});