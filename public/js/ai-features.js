// ai-features.js - COMPLETE AND WORKING
document.addEventListener('DOMContentLoaded', function() {
    console.log('Daily Dish AI Features Loaded!');
    initAIFeatures();
});

const ingredientsDatabase = [
    { id: 1, name: "Tomato", category: "Vegetables" },
    { id: 2, name: "Onion", category: "Vegetables" },
    { id: 3, name: "Garlic", category: "Vegetables" },
    { id: 4, name: "Potato", category: "Vegetables" },
    { id: 5, name: "Carrot", category: "Vegetables" },
    { id: 6, name: "Bell Pepper", category: "Vegetables" },
    { id: 7, name: "Spinach", category: "Vegetables" },
    { id: 8, name: "Broccoli", category: "Vegetables" },
    { id: 9, name: "Eggs", category: "Proteins" },
    { id: 10, name: "Chicken", category: "Proteins" },
    { id: 11, name: "Beef", category: "Proteins" },
    { id: 12, name: "Fish", category: "Proteins" },
    { id: 13, name: "Tofu", category: "Proteins" },
    { id: 14, name: "Bread", category: "Grains" },
    { id: 15, name: "Rice", category: "Grains" },
    { id: 16, name: "Pasta", category: "Grains" },
    { id: 17, name: "Milk", category: "Dairy" },
    { id: 18, name: "Cheese", category: "Dairy" },
    { id: 19, name: "Butter", category: "Dairy" },
    { id: 20, name: "Yogurt", category: "Dairy" }
];

// Global state
let currentStates = {
    weeklySchedule: false,
    surpriseMe: false,
    customDish: false,
    savedSchedule: null, // Add this
    currentSchedule: null
};

let selectedIngredients = [];
let spinInterval = null;

// Initialize AI Features
function initAIFeatures() {
    window.toggleWeeklySchedule = toggleWeeklySchedule;
    window.toggleSurpriseMe = toggleSurpriseMe;
    window.toggleCustomDish = toggleCustomDish;
    window.searchIngredients = searchIngredients;
    window.generateCustomRecipe = generateCustomRecipe;
    window.selectIngredient = selectIngredient;
    window.removeIngredient = removeIngredient;
    window.regenerateSchedule = regenerateSchedule;
}

// Get all dishes from dishManager
function getAllDishes() {
    if (!window.dishManager || !window.dishManager.isLoaded) {
        console.warn('dishManager not available or not loaded, using fallback');
        return [];
    }
    
    return window.dishManager.getAllDishes();
}

// Show error notification
function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'alert alert-danger alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        <strong>Error:</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// Show loading state
function showLoadingState(container, message = 'Loading...') {
    container.innerHTML = `
        <div class="container-fluid py-5 bg-light">
            <div class="container text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <h4>${message}</h4>
                <p class="text-muted">Please wait while we prepare your recipes...</p>
            </div>
        </div>
    `;
    container.style.display = 'block';
}

// FIXED: Weekly Schedule - Uses your 1100+ recipes
// FIXED: Weekly Schedule - With Save functionality
async function toggleWeeklySchedule() {
    const scheduleContainer = document.getElementById('weeklySchedule');
    
    if (currentStates.weeklySchedule) {
        scheduleContainer.style.display = 'none';
        currentStates.weeklySchedule = false;
    } else {
        // CHECK LOGIN FIRST
        if (!window.userManager || !window.userManager.currentUser) {
            console.log('🔐 User not logged in - showing login modal');
            window.userManager.showNotification('Please login to access Weekly Schedule', 'warning');
            
            // Show login modal after brief delay
            setTimeout(() => {
                if (window.userManager) {
                    window.userManager.showLoginModal();
                }
            }, 500);
            
            return; // STOP HERE if not logged in
        }
        
        // Check if user has a saved schedule
        const savedSchedule = window.userManager.getSavedSchedule();
        if (savedSchedule) {
            // Show saved schedule
            showSavedSchedule(scheduleContainer, savedSchedule);
            currentStates.weeklySchedule = true;
            currentStates.savedSchedule = savedSchedule;
            closeOtherSections('weeklySchedule');
            scrollToElement('weeklySchedule');
            return;
        }
        
        // User is logged in - proceed with schedule generation
        showLoadingState(scheduleContainer, 'Loading your weekly schedule...');
        
        try {
            // Wait for dishManager if needed
            if (!window.dishManager) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
            
            let schedule;
            
            // Use dishManager if available, otherwise use fallback
            if (window.dishManager && window.dishManager.isLoaded) {
                schedule = window.dishManager.generateWeeklySchedule();
            } else {
                // Fallback schedule
                schedule = window.dishManager.generateFallbackSchedule();
            }
            
            // Display the schedule with save option
            displayWeeklySchedule(scheduleContainer, schedule);
            currentStates.weeklySchedule = true;
            currentStates.currentSchedule = schedule;
            closeOtherSections('weeklySchedule');
            
            // Scroll to the schedule section
            scrollToElement('weeklySchedule');
            
        } catch (error) {
            console.error('Error generating weekly schedule:', error);
            // Show fallback schedule even on error
            const fallbackSchedule = window.dishManager.generateFallbackSchedule();
            displayWeeklySchedule(scheduleContainer, fallbackSchedule);
            currentStates.weeklySchedule = true;
            currentStates.currentSchedule = fallbackSchedule;
            closeOtherSections('weeklySchedule');
            scrollToElement('weeklySchedule');
        }
    }
}

// Display weekly schedule
function displayWeeklySchedule(container, schedule) {
    // Store the current schedule for saving
    currentStates.currentSchedule = schedule;
    
    container.innerHTML = `
        <div class="container-fluid py-5 bg-light">
            <div class="container">
                <h2 class="text-center mb-5">📅 Your Weekly Meal Schedule</h2>
                <div class="row g-4">
                    ${schedule.map(day => `
                        <div class="col-lg-6 col-xl-4">
                            <div class="card border-0 shadow h-100">
                                <div class="card-header bg-primary text-white text-center py-3">
                                    <h5 class="mb-0">${day.day}</h5>
                                </div>
                                <div class="card-body">
                                    <div class="meal-item mb-3 p-3 bg-light rounded">
                                        <h6 class="text-success">🌅 Breakfast</h6>
                                        <p class="mb-1"><strong>${day.breakfast.name}</strong></p>
                                        <small class="text-muted">Type: ${day.breakfast.type} | Time: ${day.breakfast.cookTime}</small>
                                    </div>
                                    <div class="meal-item mb-3 p-3 bg-light rounded">
                                        <h6 class="text-warning">☀️ Lunch</h6>
                                        <p class="mb-1"><strong>${day.lunch.name}</strong></p>
                                        <small class="text-muted">Type: ${day.lunch.type} | Time: ${day.lunch.cookTime}</small>
                                    </div>
                                    <div class="meal-item p-3 bg-light rounded">
                                        <h6 class="text-info">🌙 Dinner</h6>
                                        <p class="mb-1"><strong>${day.dinner.name}</strong></p>
                                        <small class="text-muted">Type: ${day.dinner.type} | Time: ${day.dinner.cookTime}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-center mt-4">
                    <button class="btn btn-success me-2" onclick="saveWeeklySchedule()">
                        💾 Save This Schedule
                    </button>
                    <button class="btn btn-primary" onclick="regenerateSchedule()">
                        🔄 Regenerate Schedule
                    </button>
                </div>
            </div>
        </div>
    `;
}

// NEW: Show saved schedule
function showSavedSchedule(container, savedSchedule) {
    container.innerHTML = `
        <div class="container-fluid py-5 bg-light">
            <div class="container">
                <h2 class="text-center mb-5">💾 Your Saved Weekly Schedule</h2>
                <div class="alert alert-info text-center mb-4">
                    <i class="fas fa-info-circle me-2"></i>
                    This is your saved weekly schedule. You can generate a new one anytime.
                </div>
                <div class="row g-4">
                    ${savedSchedule.days.map(day => `
                        <div class="col-lg-6 col-xl-4">
                            <div class="card border-0 shadow h-100">
                                <div class="card-header bg-success text-white text-center py-3">
                                    <h5 class="mb-0">${day.day}</h5>
                                </div>
                                <div class="card-body">
                                    <div class="meal-item mb-3 p-3 bg-light rounded">
                                        <h6 class="text-success">🌅 Breakfast</h6>
                                        <p class="mb-1"><strong>${day.breakfast.name}</strong></p>
                                        <small class="text-muted">Type: ${day.breakfast.type} | Time: ${day.breakfast.cookTime}</small>
                                    </div>
                                    <div class="meal-item mb-3 p-3 bg-light rounded">
                                        <h6 class="text-warning">☀️ Lunch</h6>
                                        <p class="mb-1"><strong>${day.lunch.name}</strong></p>
                                        <small class="text-muted">Type: ${day.lunch.type} | Time: ${day.lunch.cookTime}</small>
                                    </div>
                                    <div class="meal-item p-3 bg-light rounded">
                                        <h6 class="text-info">🌙 Dinner</h6>
                                        <p class="mb-1"><strong>${day.dinner.name}</strong></p>
                                        <small class="text-muted">Type: ${day.dinner.type} | Time: ${day.dinner.cookTime}</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="text-center mt-4">
                    <button class="btn btn-warning me-2" onclick="deleteSavedSchedule()">
                        🗑️ Delete Saved Schedule
                    </button>
                    <button class="btn btn-primary" onclick="generateNewSchedule()">
                        📅 Generate New Schedule
                    </button>
                </div>
            </div>
        </div>
    `;
}

function saveWeeklySchedule() {
    if (!window.userManager || !window.userManager.currentUser) {
        showErrorNotification('Please login to save your schedule');
        return;
    }
    
    if (!currentStates.currentSchedule) {
        showErrorNotification('No schedule to save');
        return;
    }
    
    const scheduleData = {
        days: currentStates.currentSchedule,
        savedAt: new Date().toISOString(),
        scheduleId: 'weekly_' + Date.now()
    };
    
    const success = window.userManager.saveWeeklySchedule(scheduleData);
    
    if (success) {
        showNotification('✅ Weekly schedule saved successfully!', 'success');
        // Update the display to show it's saved
        const scheduleContainer = document.getElementById('weeklySchedule');
        showSavedSchedule(scheduleContainer, scheduleData);
        currentStates.savedSchedule = scheduleData;
    } else {
        showErrorNotification('Failed to save schedule');
    }
}

// NEW: Delete saved schedule
function deleteSavedSchedule() {
    if (!window.userManager || !window.userManager.currentUser) {
        showErrorNotification('Please login to manage your schedule');
        return;
    }
    
    const success = window.userManager.deleteSavedSchedule();
    
    if (success) {
        showNotification('🗑️ Saved schedule deleted', 'info');
        // Regenerate a new schedule
        generateNewSchedule();
    } else {
        showErrorNotification('Failed to delete schedule');
    }
}

// NEW: Generate new schedule (when user has saved one)
function generateNewSchedule() {
    const scheduleContainer = document.getElementById('weeklySchedule');
    showLoadingState(scheduleContainer, 'Generating new weekly schedule...');
    
    setTimeout(() => {
        try {
            let schedule;
            
            if (window.dishManager && window.dishManager.isLoaded) {
                schedule = window.dishManager.generateWeeklySchedule();
            } else {
                schedule = window.dishManager.generateFallbackSchedule();
            }
            
            displayWeeklySchedule(scheduleContainer, schedule);
            currentStates.savedSchedule = null;
            
        } catch (error) {
            console.error('Error generating schedule:', error);
            const fallbackSchedule = window.dishManager.generateFallbackSchedule();
            displayWeeklySchedule(scheduleContainer, fallbackSchedule);
            currentStates.savedSchedule = null;
        }
    }, 1000);
}
// FIXED: Regenerate schedule - uses real data
// UPDATED: Regenerate schedule function
async function regenerateSchedule() {
    const scheduleContainer = document.getElementById('weeklySchedule');
    
    if (!scheduleContainer) return;
    
    showLoadingState(scheduleContainer, 'Generating new schedule...');
    
    try {
        let schedule;
        
        if (window.dishManager && window.dishManager.isLoaded) {
            schedule = window.dishManager.generateWeeklySchedule();
        } else {
            schedule = window.dishManager.generateFallbackSchedule();
        }
        
        displayWeeklySchedule(scheduleContainer, schedule);
        currentStates.savedSchedule = null;
        
    } catch (error) {
        console.error('Error regenerating schedule:', error);
        const fallbackSchedule = window.dishManager.generateFallbackSchedule();
        displayWeeklySchedule(scheduleContainer, fallbackSchedule);
        currentStates.savedSchedule = null;
    }
}
// NEW: Notification helper
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
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

// Add this function to ai-features.js (place it before toggleSurpriseMe function)
function preloadSurpriseMeImages(dishes) {
    console.log('🔄 Preloading surprise me images...');
    
    // Preload first 10 random dish images for instant display during spin
    const imagesToPreload = dishes.slice(0, 10);
    
    imagesToPreload.forEach(dish => {
        if (dish.image) {
            const img = new Image();
            img.src = dish.image;
            img.onload = () => {
                console.log(`✅ Preloaded surprise image: ${dish.name}`);
            };
            img.onerror = () => {
                console.log(`❌ Failed to preload: ${dish.name}`);
            };
        }
    });
}
// FIXED: Surprise Me - Uses your 1100+ recipes
// FIXED: Surprise Me - Properly integrated with dishManager and dishes.json
async function toggleSurpriseMe() {
    const selectedDish = document.getElementById('selectedDish');
    const celebration = document.getElementById('celebration');
    const button = document.querySelector('.surprise-btn');
    
    if (currentStates.surpriseMe) {
        selectedDish.style.display = 'none';
        celebration.style.display = 'none';
        if (spinInterval) clearInterval(spinInterval);
        currentStates.surpriseMe = false;
        button.innerHTML = 'Surprise Me';
    } else {
        try {
            selectedDish.style.display = 'block';
            celebration.style.display = 'none';
            button.innerHTML = '🎯 Selecting...';
            currentStates.surpriseMe = true;
            
            let speed = 100;
            let count = 0;
            const maxCount = 25;
            
            // Ensure dishManager is loaded
            if (!window.dishManager || !window.dishManager.isLoaded) {
                console.log('🔄 Loading dishes...');
                await window.dishManager.loadDishes();
            }
            
            // Get all dishes from dishManager
            let allDishes = window.dishManager.getAllDishes();
if (allDishes.length === 0) {
    throw new Error('No dishes available');
}

// PRELOAD images for instant loading during spin
preloadSurpriseMeImages(allDishes);

console.log(`🍽️ Using ${allDishes.length} dishes for surprise selection`);
            
            console.log(`🍽️ Using ${allDishes.length} dishes for surprise selection`);
            
            let finalDish = null;
            let usedDishes = new Set(); // Track used dishes for variety
            
            spinInterval = setInterval(() => {
                if (allDishes.length === 0) {
                    clearInterval(spinInterval);
                    return;
                }
                
                // Get a random dish that hasn't been shown recently
                let randomDish;
                let attempts = 0;
                do {
                    const randomIndex = Math.floor(Math.random() * allDishes.length);
                    randomDish = allDishes[randomIndex];
                    attempts++;
                } while (usedDishes.has(randomDish.id) && attempts < 10 && usedDishes.size < allDishes.length);
                
                usedDishes.add(randomDish.id);
                
                // Store the final dish
                if (count === maxCount - 1) {
                    finalDish = randomDish;
                }
                
                // Create scrolling effect with NO LAZY LOADING
                selectedDish.innerHTML = `
                    <div class="container-fluid py-3">
                        <div class="container">
                            <div class="card border-0 shadow-lg mx-auto" style="max-width: 800px; min-height: 580px; font-family: 'Raleway', sans-serif;">
                                <div class="card-header bg-success text-white text-center py-3">
                                    <h3 class="mb-1" style="font-family: 'Raleway', sans-serif; font-weight: 800; font-size: 40px; line-height: 48px; color: rgb(255, 255, 255);">🎲 Finding Your Dish</h3>
                                    <small>Scrolling through our recipe collection...</small>
                                </div>
                                <div class="card-body p-0">
                                    <div class="row g-0 align-items-center justify-content-center" style="min-height: 480px;">
                                        <!-- Image Column - Consistent Circle -->
                                        <div class="col-md-5">
                                            <div class="d-flex align-items-center justify-content-center p-4">
                                                <div class="square-image-container rounded-circle overflow-hidden shadow" style="width: 250px; height: 250px;">
                                                    <img src="${randomDish.image}" 
                                                        class="img-fluid h-100 w-100" 
                                                        style="object-fit: cover; object-position: center;" 
                                                        alt="${randomDish.name}"
                                                        loading="eager"
                                                        decoding="async"
                                                        onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=250&h=250&fit=crop'">
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <!-- Content Column -->
                                        <div class="col-md-7">
                                            <div class="p-4 text-center text-md-start" style="min-height: 400px; display: flex; flex-direction: column;">
                                                <!-- Top Section - Fixed Height -->
                                                <div style="flex: 0 0 auto;">
                                                    <h4 class="text-success mb-3" style="font-family: 'Raleway', sans-serif; font-weight: 800;">${randomDish.name}</h4>
                                                    
                                                    <div class="dish-details mb-4">
                                                        <div class="row text-center justify-content-center">
                                                            <div class="col-6 col-sm-3 mb-3">
                                                                <i class="fas fa-utensils fa-2x text-primary mb-2"></i>
                                                                <p class="mb-1"><strong>Category</strong></p>
                                                                <small class="text-muted">${randomDish.category || 'Main Course'}</small>
                                                            </div>
                                                            <div class="col-6 col-sm-3 mb-3">
                                                                <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                                                                <p class="mb-1"><strong>Cook Time</strong></p>
                                                                <small class="text-muted">${randomDish.cookTime || '30-40 mins'}</small>
                                                            </div>
                                                            <div class="col-6 col-sm-3">
                                                                <i class="fas fa-leaf fa-2x ${randomDish.type === 'non-veg' ? 'text-danger' : 'text-success'} mb-2"></i>
                                                                <p class="mb-1"><strong>Type</strong></p>
                                                                <small class="text-muted">
                                                                    <span class="badge ${randomDish.type === 'non-veg' ? 'bg-danger' : 'bg-success'}">
                                                                        ${randomDish.type || 'veg'}
                                                                    </span>
                                                                </small>
                                                            </div>
                                                            <div class="col-6 col-sm-3">
                                                                <i class="fas fa-globe fa-2x text-info mb-2"></i>
                                                                <p class="mb-1"><strong>Cuisine</strong></p>
                                                                <small class="text-muted">${randomDish.cuisine || 'Various'}</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <!-- Middle Section - Ingredients with Fixed Container -->
                                                <div class="mb-4" style="flex: 1 1 auto; min-height: 120px; max-height: 120px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; background: #f8f9fa;">
                                                    <h6 class="mb-2 text-center">📋 Ingredients</h6>
                                                    ${randomDish.ingredients && randomDish.ingredients.length > 0 ? `
                                                        <div class="d-flex flex-wrap gap-1 justify-content-center">
                                                            ${randomDish.ingredients.slice(0, 8).map(ing => `
                                                                <span class="badge bg-light text-dark border small p-2">${ing}</span>
                                                            `).join('')}
                                                            ${randomDish.ingredients.length > 8 ? `<span class="badge bg-secondary small p-2">+${randomDish.ingredients.length - 8} more</span>` : ''}
                                                        </div>
                                                    ` : `
                                                        <p class="text-muted text-center mb-0">No ingredients listed</p>
                                                    `}
                                                </div>
                                                
                                                <!-- Bottom Section - Fixed Height -->
                                                <div style="flex: 0 0 auto;">
                                                    <div class="text-center mt-3">
                                                        <div class="spinner-border text-primary mb-2" role="status">
                                                            <span class="visually-hidden">Selecting...</span>
                                                        </div>
                                                        <small class="text-muted">Scrolling through ${allDishes.length} authentic recipes...</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                count++;
                
                // Gradually slow down for dramatic effect
                if (count > maxCount / 2) speed += 25;
                if (count > (maxCount * 2) / 3) speed += 50;
                if (count > (maxCount * 3) / 4) speed += 75;
                
                if (count >= maxCount) {
                    clearInterval(spinInterval);
                    button.innerHTML = 'Surprise Me';
                    showFinalDish(finalDish || randomDish);
                    triggerCelebrationAnimation();
                }
            }, speed);
            
            closeOtherSections('surpriseMe');
            scrollToElement('selectedDish');
            
        } catch (error) {
            console.error('Error in surprise me:', error);
            button.innerHTML = 'Surprise Me';
            currentStates.surpriseMe = false;
            showErrorNotification('Failed to select random dish. Please try again.');
        }
    }
}


// FIXED: Show final selected dish with EXACT same layout as spinning animation
function showFinalDish(dish) {
    const selectedDish = document.getElementById('selectedDish');
    
    selectedDish.innerHTML = `
        <div class="container-fluid py-3">
            <div class="container">
                <div class="card border-0 shadow-lg mx-auto" style="max-width: 800px; min-height: 580px; font-family: 'Raleway', sans-serif;">
                    <div class="card-header bg-success text-white text-center py-3">
                        <h3 class="mb-1" style="font-family: 'Raleway', sans-serif; font-weight: 800; font-size: 40px; line-height: 48px; color: rgb(255, 255, 255);">🎉 Dish Selected!</h3>
                        <small>Your surprise dish is ready to cook</small>
                    </div>
                    <div class="card-body p-0">
                        <div class="row g-0 align-items-center justify-content-center" style="min-height: 480px;">
                            <!-- Image Column - Consistent Circle -->
                            <div class="col-md-5">
                                <div class="d-flex align-items-center justify-content-center p-4">
                                    <div class="square-image-container rounded-circle overflow-hidden shadow" style="width: 250px; height: 250px;">
                                        <img src="${dish.image}" 
                                             class="img-fluid h-100 w-100" 
                                             style="object-fit: cover; object-position: center;" 
                                             alt="${dish.name}"
                                             loading="eager"
                                             decoding="async"
                                             onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=250&h=250&fit=crop'">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Content Column -->
                            <div class="col-md-7">
                                <div class="p-4 text-center text-md-start" style="min-height: 400px; display: flex; flex-direction: column;">
                                    <!-- Top Section - Fixed Height -->
                                    <div style="flex: 0 0 auto;">
                                        <h4 class="text-success mb-3" style="font-family: 'Raleway', sans-serif; font-weight: 800;">${dish.name}</h4>
                                        
                                        <div class="dish-details mb-4">
                                            <div class="row text-center justify-content-center">
                                                <div class="col-6 col-sm-3 mb-3">
                                                    <i class="fas fa-utensils fa-2x text-primary mb-2"></i>
                                                    <p class="mb-1"><strong>Category</strong></p>
                                                    <small class="text-muted">${dish.category || 'Main Course'}</small>
                                                </div>
                                                <div class="col-6 col-sm-3 mb-3">
                                                    <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                                                    <p class="mb-1"><strong>Cook Time</strong></p>
                                                    <small class="text-muted">${dish.cookTime || '30-40 mins'}</small>
                                                </div>
                                                <div class="col-6 col-sm-3">
                                                    <i class="fas fa-leaf fa-2x ${dish.type === 'non-veg' ? 'text-danger' : 'text-success'} mb-2"></i>
                                                    <p class="mb-1"><strong>Type</strong></p>
                                                    <small class="text-muted">
                                                        <span class="badge ${dish.type === 'non-veg' ? 'bg-danger' : 'bg-success'}">
                                                            ${dish.type || 'veg'}
                                                        </span>
                                                    </small>
                                                </div>
                                                <div class="col-6 col-sm-3">
                                                    <i class="fas fa-globe fa-2x text-info mb-2"></i>
                                                    <p class="mb-1"><strong>Cuisine</strong></p>
                                                    <small class="text-muted">${dish.cuisine || 'Various'}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Middle Section - Ingredients with Fixed Container -->
                                    <div class="mb-4" style="flex: 1 1 auto; min-height: 120px; max-height: 120px; overflow-y: auto; border: 1px solid #e9ecef; border-radius: 8px; padding: 12px; background: #f8f9fa;">
                                        <h6 class="mb-2 text-center">📋 Ingredients</h6>
                                        ${dish.ingredients && dish.ingredients.length > 0 ? `
                                            <div class="d-flex flex-wrap gap-1 justify-content-center">
                                                ${dish.ingredients.slice(0, 8).map(ing => `
                                                    <span class="badge bg-light text-dark border small p-2">${ing}</span>
                                                `).join('')}
                                                ${dish.ingredients.length > 8 ? `<span class="badge bg-secondary small p-2">+${dish.ingredients.length - 8} more</span>` : ''}
                                            </div>
                                        ` : `
                                            <p class="text-muted text-center mb-0">No ingredients listed</p>
                                        `}
                                    </div>
                                    
                                    <!-- Bottom Section - Fixed Height -->
                                    <div style="flex: 0 0 auto; height: 80px; display: flex; flex-direction: column; justify-content: center;">
                                        <div class="action-buttons">
                                            <div class="row g-2 justify-content-center">
                                                <div class="col-12 col-sm-8 col-md-10">
                                                    <button class="btn btn-primary w-100 py-2" onclick="navigateToRecipeDetail(${dish.id}, '${dish.name.replace(/'/g, "\\'")}')">
                                                        <i class="fas fa-book-open me-2"></i>View Full Recipe
                                                    </button>
                                                </div>
                                                <div class="col-12 col-sm-8 col-md-10">
                                                    <button class="btn btn-outline-success w-100 py-2" onclick="selectAgain()">
                                                        <i class="fas fa-redo me-2"></i>Select Again
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// NEW: Navigate to recipe detail page
function navigateToRecipeDetail(dishId, dishName) {
    console.log('🍽️ Navigating to recipe detail:', dishId, dishName);
    
    // Create the URL for shop-detail.html with both ID and name
    const recipeUrl = `shop-detail.html?recipe=${encodeURIComponent(dishName)}&id=${dishId}`;
    
    console.log('🚀 Redirecting to:', recipeUrl);
    
    // Navigate to the recipe detail page
    window.location.href = recipeUrl;
}

// Select Again function (keep this as is)
function selectAgain() {
    const button = document.querySelector('.surprise-btn');
    
    // Reset states
    currentStates.surpriseMe = false;
    
    // Close current display
    const selectedDish = document.getElementById('selectedDish');
    selectedDish.style.display = 'none';
    
    // Small delay before restarting
    setTimeout(() => {
        toggleSurpriseMe();
    }, 300);
}

// View recipe details - integrates with your dishManager
function viewRecipeDetails(dishId) {
    console.log('Viewing recipe details for dish ID:', dishId);
    
    // You can implement this based on your existing recipe viewing system
    // For now, let's show a modal with basic info
    const allDishes = window.dishManager.getAllDishes();
    const dish = allDishes.find(d => d.id === dishId);
    
    if (dish) {
        // Create a simple modal to show recipe details
        const modalHtml = `
            <div class="modal fade" id="recipeModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">${dish.name}</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <img src="${dish.image}" class="img-fluid rounded" alt="${dish.name}" 
                                         onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'">
                                </div>
                                <div class="col-md-6">
                                    <h6>Ingredients:</h6>
                                    <ul>
                                        ${dish.ingredients ? dish.ingredients.map(ing => `<li>${ing}</li>`).join('') : '<li>No ingredients listed</li>'}
                                    </ul>
                                </div>
                            </div>
                            ${dish.recipe ? `
                                <div class="mt-3">
                                    <h6>Instructions:</h6>
                                    <ol>
                                        ${dish.recipe.map(step => `<li>${step}</li>`).join('')}
                                    </ol>
                                </div>
                            ` : ''}
                            ${dish.youtube ? `
                                <div class="mt-3">
                                    <a href="${dish.youtube.url}" target="_blank" class="btn btn-danger">
                                        <i class="fab fa-youtube me-2"></i>Watch on YouTube
                                    </a>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('recipeModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to body and show it
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const recipeModal = new bootstrap.Modal(document.getElementById('recipeModal'));
        recipeModal.show();
    } else {
        alert('Recipe details not found for this dish.');
    }
}

// Enhanced smooth scroll to element
function scrollToElement(elementId) {
    console.log(`Attempting to scroll to: ${elementId}`);
    
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id '${elementId}' not found`);
        return;
    }

    // Make sure element is visible
    element.style.display = 'block';
    
    // Small delay to ensure DOM update
    setTimeout(() => {
        try {
            // Get the element's position
            const elementRect = element.getBoundingClientRect();
            const absoluteElementTop = elementRect.top + window.pageYOffset;
            
            // Calculate scroll position with offset for header
            const offset = 80;
            const scrollPosition = absoluteElementTop - offset;

            console.log(`Scrolling to position: ${scrollPosition}`);
            
            // Smooth scroll
            window.scrollTo({
                top: scrollPosition,
                behavior: 'smooth'
            });
            
        } catch (error) {
            console.error('Error during scrolling:', error);
            // Fallback: simple scroll to element
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150);
}

// Close Other Sections
function closeOtherSections(currentSection) {
    const sections = {
        'weeklySchedule': document.getElementById('weeklySchedule'),
        'surpriseMe': document.getElementById('selectedDish'),
        'customDish': document.getElementById('customDishContainer')
    };
    
    const celebration = document.getElementById('celebration');
    
    for (const [section, element] of Object.entries(sections)) {
        if (section !== currentSection && element) {
            element.style.display = 'none';
            currentStates[section] = false;
        }
    }
    
    if (currentSection !== 'surpriseMe' && celebration) {
        celebration.style.display = 'none';
    }
    
    if (currentSection !== 'surpriseMe' && spinInterval) {
        clearInterval(spinInterval);
        const surpriseBtn = document.querySelector('.surprise-btn');
        if (surpriseBtn) surpriseBtn.innerHTML = 'Surprise Me';
    }
}

// Celebration animation
function triggerCelebrationAnimation() {
    const celebration = document.getElementById('celebration');
    if (!celebration) return;
    
    celebration.style.display = 'flex';

    if (typeof lottie !== 'undefined') {
        const containers = [
            'popper1', 'popper2', 'popper3', 'popper4', 
            'popper5', 'popper6', 'popper7', 'popper8'
        ].map(id => document.getElementById(id)).filter(Boolean);
        
        if (containers.length === 0) return;
        
        const animations = [];
        
        containers.forEach(container => {
            const animation = lottie.loadAnimation({
                container: container,
                renderer: 'svg',
                loop: false,
                autoplay: false,
                path: 'https://assets.lottiefiles.com/packages/lf20_8pL7xI.json'
            });
            animations.push(animation);
        });
        
        animations.forEach((animation, index) => {
            setTimeout(() => {
                animation.goToAndPlay(0);
            }, index * 150);
        });
        
        if (typeof confetti === 'function') {
            setTimeout(() => {
                confetti({
                    particleCount: 300,
                    spread: 160,
                    origin: { x: 0.5, y: 0.5 },
                    colors: ['#FFB524', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24']
                });
            }, 500);
        }
        
        setTimeout(() => {
            celebration.style.display = 'none';
            animations.forEach(animation => animation.destroy());
        }, 4000);
    } else {
        setTimeout(() => {
            celebration.style.display = 'none';
        }, 2000);
    }
}

// Toggle Custom Dish
function toggleCustomDish() {
    const customDishContainer = document.getElementById('customDishContainer');
    
    if (currentStates.customDish) {
        customDishContainer.style.display = 'none';
        currentStates.customDish = false;
        selectedIngredients.length = 0;
        updateSelectedIngredientsDisplay();
    } else {
        // Scroll to section immediately
        scrollToElement('customDishContainer');
        
        customDishContainer.innerHTML = `
            <div class="container-fluid py-5 bg-light">
                <div class="container">
                    <h2 class="text-center mb-5">🍳 Create Your Custom Dish</h2>
                    
                    <div class="row justify-content-center mb-4">
                        <div class="col-md-8">
                            <div class="position-relative">
                                <input type="text" id="ingredientSearch" class="form-control py-3" 
                                    placeholder="Search ingredients (e.g., tomato, eggs, bread, onion)"
                                    oninput="searchIngredients(this.value)">
                                <div id="ingredientResults" class="dropdown-menu w-100" style="display: none; max-height: 300px; overflow-y: auto;"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="selectedIngredients" class="row justify-content-center mb-4">
                        <div class="col-md-8">
                            <div class="selected-ingredients-container">
                                <h5 class="text-center mb-3">Selected Ingredients</h5>
                                <div id="selectedIngredientsList" class="d-flex flex-wrap gap-2 justify-content-center">
                                    <p class="text-muted">No ingredients selected yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row justify-content-center">
                        <div class="col-md-6 text-center">
                            <button id="generateRecipeBtn" class="btn btn-success btn-lg px-5 py-3" 
                                    onclick="generateCustomRecipe()" disabled>
                                <i class="fas fa-magic me-2"></i> Generate Recipe
                            </button>
                        </div>
                    </div>
                    
                    <div id="generatedRecipe" class="mt-5" style="display: none;"></div>
                </div>
            </div>
        `;
        customDishContainer.style.display = 'block';
        currentStates.customDish = true;
        closeOtherSections('customDish');
    }
}

// Search Ingredients
function searchIngredients(query) {
    const resultsContainer = document.getElementById('ingredientResults');
    if (!resultsContainer) return;

    if (!query.trim()) {
        resultsContainer.innerHTML = '';
        resultsContainer.style.display = 'none';
        return;
    }

    const results = ingredientsDatabase.filter(ingredient => 
        ingredient.name.toLowerCase().includes(query.toLowerCase())
    );

    if (results.length > 0) {
        resultsContainer.innerHTML = results.map(ingredient => `
            <button class="dropdown-item d-flex align-items-center p-3" 
                    onclick="selectIngredient(${ingredient.id})">
                <div>
                    <strong>${ingredient.name}</strong>
                    <br>
                    <small class="text-muted">${ingredient.category}</small>
                </div>
            </button>
        `).join('');
        resultsContainer.style.display = 'block';
    } else {
        resultsContainer.innerHTML = '<div class="dropdown-item text-muted p-3">No ingredients found</div>';
        resultsContainer.style.display = 'block';
    }
}

// Select Ingredient
function selectIngredient(id) {
    const ingredient = ingredientsDatabase.find(ing => ing.id === id);
    if (ingredient && !selectedIngredients.find(ing => ing.id === id)) {
        selectedIngredients.push(ingredient);
        updateSelectedIngredientsDisplay();
        updateGenerateButton();
    }
    
    const searchInput = document.getElementById('ingredientSearch');
    if (searchInput) searchInput.value = '';
    const resultsContainer = document.getElementById('ingredientResults');
    if (resultsContainer) resultsContainer.style.display = 'none';
}

// Remove Ingredient
function removeIngredient(id) {
    const index = selectedIngredients.findIndex(ing => ing.id === id);
    if (index > -1) {
        selectedIngredients.splice(index, 1);
        updateSelectedIngredientsDisplay();
        updateGenerateButton();
    }
}

// Update Selected Ingredients Display
function updateSelectedIngredientsDisplay() {
    const container = document.getElementById('selectedIngredientsList');
    if (!container) return;

    if (selectedIngredients.length === 0) {
        container.innerHTML = '<p class="text-muted">No ingredients selected yet</p>';
        return;
    }

    container.innerHTML = selectedIngredients.map(ingredient => `
        <div class="selected-ingredient badge bg-primary p-3 d-flex align-items-center">
            <span>${ingredient.name}</span>
            <button class="btn-close btn-close-white ms-2" 
                    onclick="removeIngredient(${ingredient.id})"></button>
        </div>
    `).join('');
}

// Update Generate Button
function updateGenerateButton() {
    const button = document.getElementById('generateRecipeBtn');
    if (button) {
        button.disabled = selectedIngredients.length === 0;
    }
}

// Generate Custom Recipe
function generateCustomRecipe() {
    if (selectedIngredients.length === 0) {
        alert('Please select some ingredients first!');
        return;
    }
    
    const recipeContainer = document.getElementById('generatedRecipe');
    const button = document.getElementById('generateRecipeBtn');
    
    if (!recipeContainer || !button) return;

    button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Creating Recipe...';
    button.disabled = true;

    setTimeout(() => {
        try {
            const recipe = generateSmartRecipe(selectedIngredients);
            const imageUrl = generateRecipeImage(recipe.name, selectedIngredients);
            
            recipeContainer.innerHTML = createRecipeHTML(recipe, imageUrl);
            recipeContainer.style.display = 'block';
            
        } catch (error) {
            console.error('Recipe generation failed:', error);
            recipeContainer.innerHTML = `
                <div class="alert alert-danger text-center">
                    <h4>⚠️ Recipe Generation Failed</h4>
                    <p>Error: ${error.message}</p>
                    <p>Please try again with different ingredients.</p>
                    <button class="btn btn-primary mt-2" onclick="generateCustomRecipe()">Try Again</button>
                </div>
            `;
            recipeContainer.style.display = 'block';
        } finally {
            button.innerHTML = '<i class="fas fa-magic me-2"></i> Generate New Recipe';
            button.disabled = false;
        }
    }, 1000);
}

function generateSmartRecipe(ingredients) {
    if (!ingredients || ingredients.length === 0) {
        throw new Error('No ingredients selected');
    }
    
    const ingredientNames = ingredients.map(ing => ing.name);
    const mainIngredient = ingredients[0].name;
    
    const recipeTemplates = [
        {
            name: `${mainIngredient} Stir Fry`,
            description: `A quick and delicious stir fry featuring ${ingredientNames.join(', ')}`,
            cookingTime: "15-20 mins",
            difficulty: "Easy",
            cuisineType: "Asian",
            mealType: "Dinner"
        },
        {
            name: `Baked ${mainIngredient} Medley`,
            description: `Oven-baked perfection with ${ingredientNames.join(', ')}`,
            cookingTime: "25-35 mins",
            difficulty: "Medium",
            cuisineType: "Mediterranean",
            mealType: "Dinner"
        }
    ];
    
    const template = recipeTemplates[Math.floor(Math.random() * recipeTemplates.length)];
        
    const recipeIngredients = ingredientNames.map(ing => {
        const quantities = ['200g', '1 cup', '2 large', '3 medium', '1/2 cup'];
        const quantity = quantities[Math.floor(Math.random() * quantities.length)];
        return `${quantity} ${ing}`;
    });
    
    recipeIngredients.push('2 tbsp olive oil', 'Salt to taste', 'Pepper to taste');
    
    const instructions = [
        `Prepare all ingredients: wash and chop the ${ingredientNames.join(', ')}`,
        `Heat oil in a pan over medium heat`,
        `Add ${mainIngredient.toLowerCase()} and cook for 5-7 minutes`,
        `Add remaining ingredients and season with salt and pepper`,
        `Cook for another 5-10 minutes until everything is tender`,
        `Serve hot and enjoy!`
    ];
    
    const baseCalories = 250 + (Math.random() * 300);
    const baseProtein = 15 + (Math.random() * 20);
    const baseCarbs = 30 + (Math.random() * 25);
    const baseFat = 10 + (Math.random() * 15);
    
    return {
        name: template.name,
        description: template.description,
        ingredients: recipeIngredients,
        instructions: instructions,
        cookingTime: template.cookingTime,
        difficulty: template.difficulty,
        cuisineType: template.cuisineType,
        mealType: template.mealType,
        nutritionInfo: {
            calories: `${Math.round(baseCalories)}-${Math.round(baseCalories + 50)}`,
            protein: `${Math.round(baseProtein)}-${Math.round(baseProtein + 5)}g`,
            carbs: `${Math.round(baseCarbs)}-${Math.round(baseCarbs + 8)}g`,
            fat: `${Math.round(baseFat)}-${Math.round(baseFat + 3)}g`
        }
    };
}

function generateRecipeImage(recipeName, ingredients) {
    const foodImages = [
        'img/recipe1.webp',
        'img/recipe2.webp', 
        'img/recipe3.webp',
        'img/recipe4.webp'
    ];
    
    return foodImages[Math.floor(Math.random() * foodImages.length)];
}

function createRecipeHTML(recipe, imageUrl) {
    return `
        <div class="row justify-content-center">
            <div class="col-lg-10">
                <div class="card border-0 shadow-lg">
                    <div class="card-header bg-success text-white text-center py-4">
                        <h3 class="mb-0">🍳 Your Custom Recipe!</h3>
                        <small>Created uniquely based on your ingredients</small>
                    </div>
                    <div class="card-body p-0">
                        <div class="row g-0">
                            <div class="col-md-6">
                                <img src="${imageUrl}" class="img-fluid w-100" 
                                    style="height: 400px; object-fit: cover;" alt="${recipe.name}"
                                    onerror="this.src='https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop'">
                            </div>

                            <div class="col-md-6">
                                <div class="p-4">
                                    <h4 class="text-success">${recipe.name}</h4>
                                    <p class="text-muted">${recipe.description}</p>

                                    <div class="row text-center align-items-center mb-4">
                                        <div class="col-3">
                                            <i class="fas fa-clock text-primary fa-2x"></i>
                                            <p class="mb-1"><strong>Time</strong></p>
                                            <small class="text-muted">${recipe.cookingTime}</small>
                                        </div>
                                        <div class="col-3">
                                            <div class="difficulty-icons ${recipe.difficulty.toLowerCase()}">
                                                <i class="fas fa-utensil-spoon ${recipe.difficulty === 'Easy' ? 'active' : ''} ${recipe.difficulty === 'Hard' ? 'active' : ''}"></i>
                                                <i class="fas fa-utensils ${recipe.difficulty === 'Medium' ? 'active' : ''} ${recipe.difficulty === 'Hard' ? 'active' : ''}"></i>
                                                <i class="fas fa-chef-hat ${recipe.difficulty === 'Hard' ? 'active' : ''}"></i>
                                            </div>
                                            <p class="mb-1"><strong>Difficulty</strong></p>
                                            <small class="text-muted">${recipe.difficulty}</small>
                                        </div>
                                        <div class="col-3">
                                            <i class="fas fa-globe text-info fa-2x"></i>
                                            <p class="mb-1"><strong>Cuisine</strong></p>
                                            <small class="text-muted">${recipe.cuisineType}</small>
                                        </div>
                                        <div class="col-3">
                                            <i class="fas fa-drumstick-bite text-secondary fa-2x"></i>
                                            <p class="mb-1"><strong>Meal</strong></p>
                                            <small class="text-muted">${recipe.mealType}</small>
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <h6>📋 Ingredients:</h6>
                                        <div class="d-flex flex-wrap gap-2">
                                            ${recipe.ingredients.map(ing => `
                                                <span class="badge bg-light text-dark border small p-2">${ing}</span>
                                            `).join('')}
                                        </div>
                                    </div>

                                    <div class="mb-3">
                                        <h6>👨‍🍳 Instructions:</h6>
                                        <ol class="small">
                                            ${recipe.instructions.map((instruction, index) => `
                                                <li class="mb-2">${instruction}</li>
                                            `).join('')}
                                        </ol>
                                    </div>

                                    <div class="text-center mt-4">
                                        <button class="btn btn-primary me-2" onclick="alert('Recipe saved! 📖')">
                                            <i class="fas fa-save me-1"></i> Save Recipe
                                        </button>
                                        <button class="btn btn-outline-success" onclick="generateCustomRecipe()">
                                            <i class="fas fa-redo me-1"></i> Generate Another
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}