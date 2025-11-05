// dish-manager.js - COMPLETE AND WORKING
class DishManager {
    constructor() {
        this.dishesData = {};
        this.categories = {};
        this.isLoaded = false;
    }

    async loadDishes() {
        if (this.isLoaded) return this.dishesData;
        
        try {
            console.log('📁 Loading dishes from dishes.json...');
            const response = await fetch('data/dishes.json');
            if (!response.ok) throw new Error('Failed to fetch dishes.json');
            
            this.dishesData = await response.json();
            this.isLoaded = true;
            
            console.log('✅ Dishes loaded successfully:', Object.keys(this.dishesData).length + ' categories');
            return this.dishesData;
        } catch (error) {
            console.error('❌ Failed to load dishes:', error);
            this.dishesData = {};
            return {};
        }
    }

    // Get all dishes as a flat array
    getAllDishes() {
        const allDishes = [];
        Object.values(this.dishesData).forEach(categoryArray => {
            if (Array.isArray(categoryArray)) {
                allDishes.push(...categoryArray);
            }
        });
        return allDishes;
    }

    // Search dishes by name, ingredients, or category
    searchDishes(query) {
        if (!query) return this.getAllDishes();
        
        const searchTerm = query.toLowerCase();
        return this.getAllDishes().filter(dish => 
            (dish.name && dish.name.toLowerCase().includes(searchTerm)) ||
            (dish.ingredients && dish.ingredients.some(ing => ing.toLowerCase().includes(searchTerm))) ||
            (dish.category && dish.category.toLowerCase().includes(searchTerm)) ||
            (dish.cuisine && dish.cuisine.toLowerCase().includes(searchTerm))
        );
    }

    // Get dishes by category
    getDishesByCategory(category) {
        return this.dishesData[category] || [];
    }

    // Get random dishes for features
    getRandomDishes(count = 3) {
        const allDishes = this.getAllDishes();
        const shuffled = [...allDishes].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    }

    // Generate weekly schedule from real data
    generateWeeklySchedule() {
        const allDishes = this.getAllDishes();
        
        if (allDishes.length === 0) {
            console.warn('No dishes available for schedule');
            return this.generateFallbackSchedule();
        }
        
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Filter dishes by meal type suitability
        const breakfastDishes = allDishes.filter(dish => 
            dish.category && dish.category.toLowerCase().includes('breakfast') ||
            dish.cookTime && parseInt(dish.cookTime) <= 30
        );
        
        const lunchDishes = allDishes.filter(dish => 
            dish.category && (
                dish.category.toLowerCase().includes('lunch') ||
                dish.category.toLowerCase().includes('quick') ||
                dish.category.toLowerCase().includes('fast')
            ) || !breakfastDishes.includes(dish)
        );
        
        const dinnerDishes = allDishes.filter(dish => 
            dish.category && (
                dish.category.toLowerCase().includes('dinner') ||
                dish.category.toLowerCase().includes('main') ||
                dish.category.toLowerCase().includes('special')
            ) || !breakfastDishes.includes(dish) && !lunchDishes.includes(dish)
        );
        
        // Ensure we have enough dishes for each meal type
        const finalBreakfast = breakfastDishes.length > 0 ? breakfastDishes : allDishes;
        const finalLunch = lunchDishes.length > 0 ? lunchDishes : allDishes;
        const finalDinner = dinnerDishes.length > 0 ? dinnerDishes : allDishes;
        
        return days.map(day => ({
            day,
            breakfast: this.getRandomDish(finalBreakfast),
            lunch: this.getRandomDish(finalLunch),
            dinner: this.getRandomDish(finalDinner)
        }));
    }

    getRandomDish(dishes) {
        if (!dishes || dishes.length === 0) {
            return {
                name: "Special Dish",
                type: "veg", 
                cookTime: "30-40 mins",
                category: "Main Course"
            };
        }
        return dishes[Math.floor(Math.random() * dishes.length)];
    }

    generateFallbackSchedule() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sampleDishes = [
            { name: "Brown Rice Pulao", type: "veg", cookTime: "50-60 mins", category: "Rice Dishes" },
            { name: "Chicken Karahi", type: "non-veg", cookTime: "40-50 mins", category: "Chicken Dishes" },
            { name: "Mix Vegetable", type: "veg", cookTime: "30-40 mins", category: "Vegetable Dishes" },
            { name: "Daal Chawal", type: "veg", cookTime: "35-45 mins", category: "Lentils & Beans" },
            { name: "Chicken Biryani", type: "non-veg", cookTime: "60-70 mins", category: "Rice Dishes" }
        ];
        
        return days.map(day => ({
            day,
            breakfast: sampleDishes[Math.floor(Math.random() * sampleDishes.length)],
            lunch: sampleDishes[Math.floor(Math.random() * sampleDishes.length)],
            dinner: sampleDishes[Math.floor(Math.random() * sampleDishes.length)]
        }));
    }

    // Surprise me feature
    surpriseMe() {
        const allDishes = this.getAllDishes();
        if (allDishes.length === 0) {
            return {
                name: "Special Chef's Creation",
                type: "veg",
                cookTime: "30-40 mins",
                category: "Main Course"
            };
        }
        return allDishes[Math.floor(Math.random() * allDishes.length)];
    }
}

// Create global instance
window.dishManager = new DishManager();

// Auto-load dishes when the class is created
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ Dish Manager Initialized');
    window.dishManager.loadDishes();
});