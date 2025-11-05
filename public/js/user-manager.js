// user-manager.js - COMPLETE LIVE VERSION - NO DEMO FALLBACKS
class UserManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.users = JSON.parse(localStorage.getItem('dailyDishUsers')) || {};
        this.favorites = JSON.parse(localStorage.getItem('dailyDishFavorites')) || {};
        this.ratings = JSON.parse(localStorage.getItem('dailyDishRatings')) || {};
        this.comments = JSON.parse(localStorage.getItem('dailyDishComments')) || {};
        this.isFirebaseReady = false;
        this.auth = null;
        this.db = null;
        this.otpStore = JSON.parse(localStorage.getItem('dailyDishOTP')) || {};
        setTimeout(() => this.updateFavoriteIcons(), 2000);
        setTimeout(() => this.forceAuthSync(), 500);
        console.log('👤 UserManager Constructor Initialized');
        this.init();
    }

    async init() {
        console.log('🚀 UserManager Starting Initialization...');
        
        // Initialize Firebase immediately
        this.setupFirebase();
        
        // Load current user from localStorage
        this.loadCurrentUser();
        
        // Setup UI
        this.showUserMenu();
        this.updateShoppingBagCounter();
        
        console.log('✅ UserManager Initialization Complete');
    }

    setupFirebase() {
    try {
        if (typeof firebase === 'undefined' || !firebase.app) {
            console.log('⚠️ Firebase not available, using localStorage fallback');
            this.isFirebaseReady = false;
            return;
        }

        let app;
        try {
            app = firebase.app();
            console.log('🔥 Firebase App already initialized');
        } catch (e) {
            console.log('🔥 Initializing Firebase App...');
            const firebaseConfig = {
                apiKey: "AIzaSyBLbKi6o3S6butuuSsW2TdfewBm3AtBohg",
                authDomain: "daily-dish-app.firebaseapp.com",
                projectId: "daily-dish-app",
                storageBucket: "daily-dish-app.firebasestorage.app",
                messagingSenderId: "1070129699117",
                appId: "1:1070129699117:web:d535f5eee001d132661ba4",
                measurementId: "G-Z9M2CVB9MX"
            };
            app = firebase.initializeApp(firebaseConfig);
        }

        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.isFirebaseReady = true;
        
        console.log('✅ Firebase setup successful');

        // Set up auth state listener with error handling
        this.auth.onAuthStateChanged(async (user) => {
            try {
                console.log('🔄 Firebase Auth State Changed:', user ? user.email : 'No user');
                
                if (user) {
                    this.currentUser = user;
                    await this.loadUserData(user.uid);
                    this.showUserMenu();
                    this.updateShoppingBagCounter();
                    
                    // Show welcome message only once
                    if (sessionStorage.getItem('welcomeShown') !== 'true') {
                        const username = user.displayName || user.email?.split('@')[0] || 'User';
                        this.showNotification(`Welcome back, ${username}!`, 'success');
                        sessionStorage.setItem('welcomeShown', 'true');
                    }
                } else {
                    // No user logged in
                    this.currentUser = null;
                    this.userData = null;
                    this.showUserMenu();
                    this.updateShoppingBagCounter();
                    sessionStorage.removeItem('welcomeShown');
                }
            } catch (error) {
                console.log('🌐 No internet - using localStorage only');
                this.isFirebaseReady = false;
                // Continue with localStorage only - don't throw error
            }
        });
        
    } catch (error) {
        console.log('🌐 Firebase setup failed (no internet) - using localStorage');
        this.isFirebaseReady = false;
        // Continue with localStorage only - don't throw error
    }
}
    async handleGoogleLoginSuccess(user) {
    try {
        console.log('🎉 Handling Google login success for:', user.email);
        
        // Check if user exists in our database, if not create account
        const userDoc = await this.db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            // Create new user account
            await this.db.collection('users').doc(user.uid).set({
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {},
                favorites: [],
                shoppingList: [],
                ratings: {},
                comments: [],
                emailVerified: true,
                isGoogleAccount: true,
                profilePhoto: user.photoURL || null
            });
            console.log('✅ New Google user account created');
        } else {
            console.log('✅ Existing Google user logged in');
        }
        
        // Load user data and update UI
        this.currentUser = user;
        await this.loadUserData(user.uid);
        this.showUserMenu();
        this.updateShoppingBagCounter();
        
        // Show welcome notification
        const username = user.displayName || user.email.split('@')[0];
        this.showNotification(`Welcome to Daily Dish, ${username}! 🎉`, 'success');
        
        // Close any open auth modals
        const authModal = document.getElementById('authModal');
        if (authModal) {
            const modal = bootstrap.Modal.getInstance(authModal);
            if (modal) modal.hide();
        }
        
    } catch (error) {
        console.error('❌ Error handling Google login success:', error);
        this.showNotification('Error completing Google login', 'error');
    }
}
    setupLocalStorage() {
        console.log('💾 Using localStorage fallback exclusively');
        this.isFirebaseReady = false;
    }

    loadCurrentUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = savedUser;
            this.userData = this.users[this.currentUser] || this.createDefaultUserData();
            console.log('📋 Loaded user from localStorage:', this.currentUser);
        }
    }

    createDefaultUserData() {
    // FIX: Check if currentUser is string before using split
    let username = 'User';
    let email = 'user@example.com';
    
    if (typeof this.currentUser === 'string') {
        username = this.currentUser.split('@')[0];
        email = this.currentUser;
    } else if (this.currentUser && this.currentUser.email) {
        username = this.currentUser.email.split('@')[0];
        email = this.currentUser.email;
    }
    
    return {
        username: username,
        email: email,
        joined: new Date().toISOString(),
        preferences: {},
        favorites: [],
        shoppingList: [],
        ratings: {},
        comments: []
    };
}

    async register(username, email, password) {
        console.log('👤 Registration attempt with OTP:', { username, email });
        
        try {
            if (!username || !email || !password) {
                return { success: false, message: 'All fields are required' };
            }

            if (password.length < 6) {
                return { success: false, message: 'Password must be at least 6 characters' };
            }

            if (!this.otpStore || !this.otpStore[email] || !this.otpStore[email].verified) {
                return { success: false, message: 'Please verify your email with OTP first' };
            }

            if (this.isFirebaseReady) {
                const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                await this.db.collection('users').doc(user.uid).set({
                    username: username,
                    email: email,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    preferences: {},
                    favorites: [],
                    shoppingList: [],
                    ratings: {},
                    comments: [],
                    emailVerified: true
                });
                
                if (this.otpStore[email]) {
                    delete this.otpStore[email];
                    localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                }
                
                return { success: true, message: 'Registration successful! You can now login.' };
                
            } else {
                if (this.users[email]) {
                    return { success: false, message: 'User already exists with this email' };
                }

                this.users[email] = {
                    username: username,
                    email: email,
                    password: btoa(password),
                    joined: new Date().toISOString(),
                    preferences: {},
                    favorites: [],
                    shoppingList: [],
                    ratings: {},
                    comments: [],
                    emailVerified: true
                };

                this.saveUsers();
                
                if (this.otpStore[email]) {
                    delete this.otpStore[email];
                    localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                }
                
                return { success: true, message: 'Registration successful! You can now login.' };
            }
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            let errorMessage = 'Registration failed. Please try again.';
            
            if (error.code) {
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Email is already registered.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'Invalid email address.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'Password is too weak.';
                        break;
                    default:
                        errorMessage = error.message;
                }
            }
            
            return { success: false, message: errorMessage };
        }
    }

    async login(email, password) {
    console.log('🔐 Login attempt:', email);
    
    try {
        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        if (this.isFirebaseReady) {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Firebase login successful');
            return { 
                success: true, 
                message: 'Login successful!',
                user: user.email
            };
            
        } else {
            const user = this.users[email];
            if (!user) {
                return { success: false, message: 'User not found. Please register first.' };
            }

            if (user.password !== btoa(password)) {
                return { success: false, message: 'Invalid password.' };
            }

            this.currentUser = email;
            this.userData = user;
            localStorage.setItem('currentUser', email);
            
            this.showUserMenu();
            this.updateShoppingBagCounter();
            
            console.log('✅ LocalStorage login successful');
            return { 
                success: true, 
                message: 'Login successful!',
                user: user.username || user.email.split('@')[0]
            };
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        
        // === PROFESSIONAL GOOGLE USER DETECTION ===
        if (error.code === 'auth/invalid-login-credentials' && this.isFirebaseReady) {
            try {
                // Check if user exists with Google
                const methods = await this.auth.fetchSignInMethodsForEmail(email);
                
                if (methods && methods.includes('google.com')) {
                    return { 
                        success: false, 
                        message: 'This email is registered with Google. Please use the "Continue with Google" button to login.',
                        isGoogleUser: true
                    };
                }
            } catch (methodsError) {
                console.log('Could not check sign-in methods:', methodsError);
            }
        }
        
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.code) {
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'User not found. Please register first.';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Invalid password.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address.';
                    break;
                default:
                    errorMessage = error.message;
            }
        }
        
        return { success: false, message: errorMessage };
    }
}

    async logout() {
    console.log('🚪 Logout requested');
    
    try {
        if (this.isFirebaseReady && this.auth) {
            await this.auth.signOut();
        }
        
        this.currentUser = null;
        this.userData = null;
        localStorage.removeItem('currentUser');
        sessionStorage.removeItem('welcomeShown');
        
        this.showUserMenu();
        this.updateShoppingBagCounter();
        
        this.showNotification('You have been logged out successfully.', 'success');
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            const modal = bootstrap.Modal.getInstance(profileModal);
            if (modal) modal.hide();
        }
        
        // FIX: Refresh page after logout to reset all states
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        this.showNotification('Logout failed. Please try again.', 'error');
    }
}

    // SHOPPING LIST SYSTEM - GUARANTEED WORKING
    async addToShoppingList(dish) {
    console.log('🛒 Adding to shopping list:', dish?.name || dish);
    
    // IMMEDIATE LOGIN CHECK - Show login modal FIRST, STOP execution
    if (!this.currentUser) {
        this.showNotification('Please login to add items to your shopping list', 'warning');
        setTimeout(() => this.showLoginModal(), 500);
        return false;
    }

    try {
        const dishToAdd = typeof dish === 'object' ? dish : { 
            id: Date.now(), 
            name: dish, 
            type: 'ingredient',
            category: 'Shopping Item'
        };

        if (this.isFirebaseReady && this.currentUser.uid) {
            // FIREBASE VERSION
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.error('❌ User document not found in Firestore');
                return false;
            }

            const userData = userDoc.data();
            let shoppingList = userData.shoppingList || [];

            // IMPROVED DUPLICATE CHECK - Check by name (case insensitive)
            const existingItem = shoppingList.find(item => 
                item.name.toLowerCase().trim() === dishToAdd.name.toLowerCase().trim()
            );

            if (existingItem) {
                console.log(`⏭️ Item already exists: ${dishToAdd.name}`);
                return false; // Return false for duplicates
            }

            // Add new item
            shoppingList.push({
                ...dishToAdd,
                addedAt: new Date().toISOString(),
                quantity: 1,
                purchased: false
            });

            await userRef.update({ shoppingList });
            await this.loadUserData(this.currentUser.uid);
            
        } else {
            // LOCALSTORAGE VERSION
            let shoppingList = this.userData.shoppingList || [];

            // IMPROVED DUPLICATE CHECK
            const existingItem = shoppingList.find(item => 
                item.name.toLowerCase().trim() === dishToAdd.name.toLowerCase().trim()
            );

            if (existingItem) {
                console.log(`⏭️ Item already exists: ${dishToAdd.name}`);
                return false; // Return false for duplicates
            }

            // Add new item
            shoppingList.push({
                ...dishToAdd,
                addedAt: new Date().toISOString(),
                quantity: 1,
                purchased: false
            });

            this.userData.shoppingList = shoppingList;
            
            // Update users data
            if (typeof this.currentUser === 'string') {
                this.users[this.currentUser] = this.userData;
                this.saveUsers();
            }
        }

        console.log(`✅ Successfully added: ${dishToAdd.name}`);
        this.updateShoppingBagCounter();
        return true;
        
    } catch (error) {
        console.error('❌ Error adding to shopping list:', error);
        this.showNotification('Failed to add item to shopping list', 'error');
        return false;
    }
}
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
// In UserManager - make sure this exists and works
// Enhanced forceAddToShoppingList method
async forceAddToShoppingList(dish) {
    console.log('💥 FORCE ADDING to shopping list:', dish?.name);
    
    if (!this.currentUser) {
        console.log('❌ User not logged in');
        return false;
    }

    try {
        const dishToAdd = {
            id: dish.id || Date.now() + Math.random(), // Always unique
            name: dish.name,
            type: dish.type || 'ingredient',
            category: dish.category || 'Shopping Item',
            addedAt: new Date().toISOString(),
            quantity: 1,
            purchased: false
        };

        console.log('🔄 FORCE: Starting add process for:', dishToAdd.name);

        if (this.isFirebaseReady && this.currentUser.uid) {
            // FIREBASE VERSION
            console.log('🔥 FORCE: Using Firebase');
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.error('❌ FORCE: User document not found');
                return false;
            }

            const userData = userDoc.data();
            let shoppingList = userData.shoppingList || [];

            // FORCE ADD - No duplicate checking
            console.log(`🔥 FORCE: Adding "${dishToAdd.name}" to Firebase list`);
            shoppingList.push(dishToAdd);
            
            await userRef.update({ shoppingList });
            await this.loadUserData(this.currentUser.uid);
            
            console.log(`✅ FORCE: Successfully added to Firebase: ${dishToAdd.name}`);
            
        } else {
            // LOCALSTORAGE VERSION
            console.log('💾 FORCE: Using localStorage');
            let shoppingList = this.userData.shoppingList || [];
            
            console.log(`💾 FORCE: Adding "${dishToAdd.name}" to localStorage list`);
            shoppingList.push(dishToAdd);
            this.userData.shoppingList = shoppingList;
            
            if (typeof this.currentUser === 'string') {
                this.users[this.currentUser] = this.userData;
                this.saveUsers();
            }
            
            console.log(`✅ FORCE: Successfully added to localStorage: ${dishToAdd.name}`);
        }

        this.updateShoppingBagCounter();
        return true;
        
    } catch (error) {
        console.error('❌ FORCE: Error in forceAddToShoppingList:', error);
        return false;
    }
}
    getShoppingList() {
        if (!this.currentUser) {
            return [];
        }

        try {
            if (this.isFirebaseReady && this.userData) {
                return this.userData.shoppingList || [];
            } else if (this.userData && this.userData.shoppingList) {
                return this.userData.shoppingList;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error getting shopping list:', error);
            return [];
        }
    }

    // SHOPPING BAG COUNTER - GUARANTEED WORKING
    updateShoppingBagCounter() {
        try {
            const shoppingList = this.getShoppingList();
            const bagCount = shoppingList.length;
            
            console.log(`🛒 Updating shopping bag counter: ${bagCount} items`);
            
            // Update ALL shopping bag icons on the page
            const bagIcons = document.querySelectorAll('.fa-shopping-bag');
            
            bagIcons.forEach(bagIcon => {
                const bagLink = bagIcon.closest('a');
                if (bagLink) {
                    let badge = bagLink.querySelector('span');
                    
                    // Create badge if it doesn't exist
                    if (!badge) {
                        badge = document.createElement('span');
                        badge.className = 'position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1';
                        badge.style.cssText = 'top: -5px; left: 15px; height: 20px; min-width: 20px; font-size: 12px;';
                        bagLink.appendChild(badge);
                    }
                    
                    // Update badge content and visibility
                    badge.textContent = bagCount;
                    badge.style.display = bagCount > 0 ? 'flex' : 'none';
                    
                    console.log(`🛒 Updated badge: ${bagCount} items`);
                }
            });
            
            // Also update any other shopping bag counters
            const otherCounters = document.querySelectorAll('[data-shopping-bag-counter]');
            otherCounters.forEach(counter => {
                counter.textContent = bagCount;
                counter.style.display = bagCount > 0 ? 'inline' : 'none';
            });
            
        } catch (error) {
            console.error('❌ Error updating shopping bag counter:', error);
        }
    }
// NEW FUNCTION: Update shopping list in profile modal properly
updateProfileModalShoppingList(updatedList) {
    try {
        const profileModal = document.getElementById('profileModal');
        if (!profileModal) return;
        
        const shoppingListContainer = profileModal.querySelector('.shopping-list');
        const shoppingListCount = profileModal.querySelector('.fa-shopping-bag').closest('.card-body').querySelector('h6');
        
        if (shoppingListContainer && shoppingListCount) {
            // Update count
            shoppingListCount.innerHTML = `<i class="fas fa-shopping-bag me-2"></i>Shopping List (${updatedList.length})`;
            
            // Update list with PROPER indexes
            if (updatedList.length > 0) {
                shoppingListContainer.innerHTML = updatedList.map((item, index) => `
                    <div class="d-flex justify-content-between align-items-center border-bottom py-2 cart-item" data-item-index="${index}">
                        <span class="text-dark">${item.name}</span>
                        <button class="btn btn-sm btn-outline-danger remove-cart-item-btn" 
                                data-item-index="${index}" data-item-name="${item.name}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `).join('');
                
                // Re-attach event listeners to new buttons
                this.attachShoppingListRemoveHandlers();
            } else {
                shoppingListContainer.innerHTML = '<p class="text-muted text-center py-3"><i class="fas fa-shopping-basket me-2"></i>No items in shopping list</p>';
            }
        }
        
        console.log('✅ Updated profile modal shopping list');
    } catch (error) {
        console.error('❌ Error updating profile modal shopping list:', error);
    }
}

// NEW FUNCTION: Attach handlers to shopping list remove buttons
attachShoppingListRemoveHandlers() {
    try {
        document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
            // Remove existing listeners by cloning
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const itemIndex = parseInt(e.target.closest('button').getAttribute('data-item-index'));
                const itemName = e.target.closest('button').getAttribute('data-item-name');
                
                console.log('🗑️ Removing cart item from profile:', itemIndex, itemName);
                
                this.removeFromShoppingList(itemIndex);
            });
        });
        
        console.log('✅ Attached shopping list remove handlers');
    } catch (error) {
        console.error('❌ Error attaching shopping list remove handlers:', error);
    }
}
    // FAVORITES SYSTEM - GUARANTEED WORKING
    async toggleFavorite(dish) {
    console.log('❤️ Toggle favorite:', dish?.name);
    
    // IMMEDIATE LOGIN CHECK - Show login modal FIRST, STOP execution
    if (!this.currentUser) {
        console.log('🔐 User not logged in - showing login modal');
        this.showNotification('Please login to save favorites', 'warning');
        setTimeout(() => this.showLoginModal(), 500); // Show login modal after brief delay
        return false; // STOP EXECUTION HERE - no success message
    }

    if (!dish || !dish.id) {
        console.error('❌ Invalid dish object:', dish);
        return false;
    }

    try {
        let isNowFavorite = false;

        if (this.isFirebaseReady && this.currentUser.uid) {
            // FIREBASE VERSION
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.error('❌ User document not found in Firestore');
                return false;
            }

            const userData = userDoc.data();
            let favorites = userData.favorites || [];
            const existingIndex = favorites.findIndex(fav => fav.id === dish.id);

            if (existingIndex > -1) {
                // Remove from favorites
                favorites.splice(existingIndex, 1);
                isNowFavorite = false;
                console.log('✅ Removed from favorites');
            } else {
                // Add to favorites
                favorites.push({
                    id: dish.id,
                    name: dish.name,
                    image: dish.image || 'img/fruite-item-5.webp',
                    cookTime: dish.cookTime || '30-40 mins',
                    category: dish.category,
                    type: dish.type,
                    addedAt: new Date().toISOString()
                });
                isNowFavorite = true;
                console.log('✅ Added to favorites');
            }

            await userRef.update({ favorites });
            await this.loadUserData(this.currentUser.uid);
            
        } else {
            // LOCALSTORAGE VERSION
            let favorites = this.userData.favorites || [];
            const existingIndex = favorites.findIndex(fav => fav.id === dish.id);

            if (existingIndex > -1) {
                // Remove from favorites
                favorites.splice(existingIndex, 1);
                isNowFavorite = false;
                console.log('✅ Removed from favorites');
            } else {
                // Add to favorites
                favorites.push({
                    id: dish.id,
                    name: dish.name,
                    image: dish.image || 'img/fruite-item-5.webp',
                    cookTime: dish.cookTime || '30-40 mins',
                    category: dish.category,
                    type: dish.type,
                    addedAt: new Date().toISOString()
                });
                isNowFavorite = true;
                console.log('✅ Added to favorites');
            }

            this.userData.favorites = favorites;
            
            // Update users data
            if (typeof this.currentUser === 'string') {
                this.users[this.currentUser] = this.userData;
                this.saveUsers();
            }
        }

        // INSTANTLY UPDATE THE HEART BUTTON ON THE PAGE
        this.updateFavoriteButton(dish.id, isNowFavorite);
        
        // Update favorite icons in profile modal if open
        this.updateProfileModalFavorites();

        // Show appropriate notification (ONLY ONE MESSAGE)
        if (isNowFavorite) {
            this.showNotification(`❤️ ${dish.name} added to favorites!`, 'success');
        } else {
            this.showNotification(`💔 ${dish.name} removed from favorites`, 'info');
        }
        
        return isNowFavorite;
        
    } catch (error) {
        console.error('❌ Error toggling favorite:', error);
        this.showNotification('Failed to update favorites', 'error');
        return false;
    }
}


    // Update favorites in profile modal without closing it
    updateProfileModalFavorites() {
        try {
            const profileModal = document.getElementById('profileModal');
            if (!profileModal) return;
            
            const favorites = this.getFavorites();
            const favoritesContainer = profileModal.querySelector('.favorites-list');
            const favoritesCount = profileModal.querySelector('.fa-heart').closest('.card-body').querySelector('h6');
            
            if (favoritesContainer && favoritesCount) {
                // Update count
                favoritesCount.innerHTML = `<i class="fas fa-heart me-2"></i>Favorite Recipes (${favorites.length})`;
                
                // Update list
                if (favorites.length > 0) {
                    favoritesContainer.innerHTML = favorites.map((fav, index) => `
                        <div class="d-flex justify-content-between align-items-center border-bottom py-2 favorite-item" data-dish-id="${fav.id}">
                            <span class="text-dark">${fav.name}</span>
                            <button class="btn btn-sm btn-outline-danger remove-favorite-btn" 
                                    data-dish-id="${fav.id}" data-dish-name="${fav.name}">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('');
                    
                    // Re-attach event listeners to new buttons
                    this.attachFavoriteRemoveHandlers();
                } else {
                    favoritesContainer.innerHTML = '<p class="text-muted text-center py-3"><i class="fas fa-heart-broken me-2"></i>No favorites yet</p>';
                }
            }
            
            console.log('✅ Updated profile modal favorites');
        } catch (error) {
            console.error('❌ Error updating profile modal favorites:', error);
        }
    }

    // Attach event listeners to favorite remove buttons
    attachFavoriteRemoveHandlers() {
        try {
            document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
                // Remove existing listeners by cloning
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                
                newBtn.addEventListener('click', (e) => {
                    const dishId = parseInt(e.target.closest('button').getAttribute('data-dish-id'));
                    const dishName = e.target.closest('button').getAttribute('data-dish-name');
                    
                    console.log('🗑️ Removing favorite from profile:', dishId, dishName);
                    
                    const favorites = this.getFavorites();
                    const dish = favorites.find(f => f.id === dishId);
                    
                    if (dish) {
                        this.toggleFavorite(dish);
                    }
                });
            });
            
            console.log('✅ Attached favorite remove handlers');
        } catch (error) {
            console.error('❌ Error attaching favorite remove handlers:', error);
        }
    }

    // Update specific favorite button instantly
    updateFavoriteButton(dishId, isFavorite) {
        try {
            console.log('💖 Updating favorite button for dish:', dishId, 'isFavorite:', isFavorite);
            
            // Find ALL heart buttons for this dish (multiple instances on page)
            const heartButtons = document.querySelectorAll(`[data-dish-id="${dishId}"] .btn-outline-danger, [data-dish-id="${dishId}"] .btn-danger`);
            
            heartButtons.forEach(button => {
                if (isFavorite) {
                    // Change to filled heart
                    button.classList.remove('btn-outline-danger');
                    button.classList.add('btn-danger');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    button.title = 'Remove from favorites';
                } else {
                    // Change to outline heart
                    button.classList.remove('btn-danger');
                    button.classList.add('btn-outline-danger');
                    button.innerHTML = '<i class="fas fa-heart"></i>';
                    button.title = 'Add to favorites';
                }
                
                // Add animation
                button.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 300);
            });
            
            console.log(`✅ Updated ${heartButtons.length} heart buttons for dish ${dishId}`);
            
        } catch (error) {
            console.error('❌ Error updating favorite button:', error);
        }
    }

    isFavorite(dish) {
        if (!this.currentUser || !dish || !dish.id) {
            return false;
        }

        try {
            const favorites = this.getFavorites();
            return favorites.some(fav => fav.id === dish.id);
        } catch (error) {
            console.error('❌ Error checking favorite:', error);
            return false;
        }
    }

    getFavorites() {
        if (!this.currentUser) {
            return [];
        }

        try {
            if (this.isFirebaseReady && this.userData) {
                return this.userData.favorites || [];
            } else if (this.userData && this.userData.favorites) {
                return this.userData.favorites;
            } else {
                return [];
            }
        } catch (error) {
            console.error('❌ Error getting favorites:', error);
            return [];
        }
    }

    // RATINGS SYSTEM - GUARANTEED WORKING
    getDishRating(dish) {
        if (!dish || !dish.id) {
            return { average: 0, count: 0 };
        }

        try {
            let ratings = [];

            if (this.isFirebaseReady) {
                // Firebase ratings would be stored per dish in a separate collection
                // For now, use localStorage fallback
                ratings = this.ratings[dish.id] || [];
            } else {
                ratings = this.ratings[dish.id] || [];
            }

            if (ratings.length === 0) {
                return { average: 0, count: 0 };
            }

            const sum = ratings.reduce((total, rating) => total + rating.rating, 0);
            const average = sum / ratings.length;
            
            return {
                average: Math.round(average * 10) / 10, // Round to 1 decimal
                count: ratings.length
            };
            
        } catch (error) {
            console.error('❌ Error getting dish rating:', error);
            return { average: 0, count: 0 };
        }
    }

    rateDish(dish, rating, comment = '') {
        console.log('⭐ Rating dish:', dish?.name, 'Rating:', rating);
        
        if (!this.currentUser) {
            this.showNotification('Please login to rate dishes', 'warning');
            return false;
        }

        if (!dish || !dish.id || rating < 1 || rating > 5) {
            console.error('❌ Invalid rating data:', { dish, rating });
            return false;
        }

        try {
            const ratingData = {
                dishId: dish.id,
                dishName: dish.name,
                rating: rating,
                comment: comment,
                userId: this.isFirebaseReady ? this.currentUser.uid : this.currentUser,
                userEmail: this.isFirebaseReady ? this.currentUser.email : this.currentUser,
                timestamp: new Date().toISOString()
            };

            if (this.isFirebaseReady) {
                // Firebase version - store in ratings collection
                const ratingRef = this.db.collection('ratings').doc();
                ratingRef.set(ratingData).then(() => {
                    console.log('✅ Rating saved to Firebase');
                }).catch(error => {
                    console.error('❌ Error saving rating to Firebase:', error);
                    // Fallback to localStorage
                    this.saveRatingToLocalStorage(dish.id, ratingData);
                });
            } else {
                // LocalStorage version
                this.saveRatingToLocalStorage(dish.id, ratingData);
            }

            this.showNotification(`✅ Thanks for rating ${dish.name}!`, 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error rating dish:', error);
            this.showNotification('Failed to save rating', 'error');
            return false;
        }
    }

    saveRatingToLocalStorage(dishId, ratingData) {
        if (!this.ratings[dishId]) {
            this.ratings[dishId] = [];
        }
        this.ratings[dishId].push(ratingData);
        localStorage.setItem('dailyDishRatings', JSON.stringify(this.ratings));
    }

    // COMMENTS SYSTEM
    addComment(dish, comment, userName = '') {
        console.log('💬 Adding comment to:', dish?.name);
        
        if (!this.currentUser) {
            this.showNotification('Please login to add comments', 'warning');
            return false;
        }

        if (!dish || !dish.id || !comment.trim()) {
            console.error('❌ Invalid comment data');
            return false;
        }

        try {
            const commentData = {
                dishId: dish.id,
                dishName: dish.name,
                comment: comment.trim(),
                userName: userName || (this.userData?.username || (typeof this.currentUser === 'string' ? this.currentUser.split('@')[0] : this.currentUser.email.split('@')[0])),
                userEmail: typeof this.currentUser === 'string' ? this.currentUser : this.currentUser.email,
                timestamp: new Date().toISOString()
            };

            if (this.isFirebaseReady) {
                // Firebase version
                const commentRef = this.db.collection('comments').doc();
                commentRef.set(commentData);
            } else {
                // LocalStorage version
                if (!this.comments[dish.id]) {
                    this.comments[dish.id] = [];
                }
                this.comments[dish.id].push(commentData);
                localStorage.setItem('dailyDishComments', JSON.stringify(this.comments));
            }

            this.showNotification('✅ Comment added successfully!', 'success');
            return true;
            
        } catch (error) {
            console.error('❌ Error adding comment:', error);
            this.showNotification('Failed to add comment', 'error');
            return false;
        }
    }

    // USER PROFILE MANAGEMENT
    async loadUserData(userId) {
        if (!this.isFirebaseReady || !userId) return;

        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                this.userData = userDoc.data();
                console.log('📦 User data loaded from Firestore');
            } else {
                console.log('⚠️ No user data found in Firestore');
                this.userData = this.createDefaultUserData();
            }
        } catch (error) {
            console.error('❌ Error loading user data from Firestore:', error);
            this.userData = this.createDefaultUserData();
        }
    }

    // UI METHODS - GUARANTEED WORKING
    showUserMenu() {
    console.log('👤 Setting up user menu, current user:', this.currentUser);
    
    try {
        // Wait for DOM to be ready
        setTimeout(() => {
            const userIcons = document.querySelectorAll('.fa-user');
            
            if (userIcons.length === 0) {
                console.log('⏳ User icons not found, retrying in 500ms...');
                setTimeout(() => this.showUserMenu(), 500);
                return;
            }

            userIcons.forEach(userIcon => {
                const userLink = userIcon.closest('a');
                if (userLink) {
                    // Remove all existing click events first
                    const newLink = userLink.cloneNode(true);
                    userLink.parentNode.replaceChild(newLink, userLink);
                    
                    if (this.currentUser) {
                        // User is logged in - Show profile with page-specific message
                        const username = this.userData?.username || 
                                       (typeof this.currentUser === 'string' ? this.currentUser.split('@')[0] : this.currentUser.email?.split('@')[0]) || 
                                       'User';
                        
                        // Page-specific welcome messages
                        const currentPage = window.location.pathname;
                        let welcomeMessage = `Welcome back, ${username}!`;
                        
                        if (currentPage.includes('index.html') || currentPage === '/') {
                            welcomeMessage = `Welcome home, ${username}! 🏠`;
                        } else if (currentPage.includes('shop.html')) {
                            welcomeMessage = `Happy cooking, ${username}! 👨‍🍳`;
                        } else if (currentPage.includes('shop-detail.html')) {
                            welcomeMessage = `Recipe time, ${username}! 📖`;
                        }
                        
                        newLink.innerHTML = `
                            <i class="fas fa-user fa-2x"></i>
                            <span class="position-absolute bg-secondary rounded-circle d-flex align-items-center justify-content-center text-dark px-1" 
                                  style="top: -5px; left: 15px; height: 20px; min-width: 20px; font-size: 10px;">
                                👋
                            </span>
                        `;
                        newLink.setAttribute('title', welcomeMessage);
                        
                        newLink.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('👤 Profile clicked, user:', username);
                            this.showUserProfile();
                        };
                        
                    } else {
                        // User is not logged in - Show login
                        newLink.innerHTML = '<i class="fas fa-user fa-2x"></i>';
                        newLink.setAttribute('title', 'Login to your account');
                        
                        newLink.onclick = (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log('🔐 Login clicked');
                            this.showLoginModal();
                        };
                    }
                }
            });
            
            console.log('✅ User menu setup complete');
            
        }, 100);
        
    } catch (error) {
        console.error('❌ Error setting up user menu:', error);
        setTimeout(() => this.showUserMenu(), 1000);
    }
}

    // REAL EMAIL VIA EMAILJS - NO DEMO FALLBACK
    // FIXED EMAILJS IMPLEMENTATION
async sendRealEmail(email, otp) {
    return new Promise(async (resolve) => {
        try {
            console.log('📧 Starting EmailJS send process...');
            
            const emailJSConfig = {
                publicKey: '_8bV1RGk8HfzdzJjA',
                serviceID: 'service_xtwhihp',  
                templateID: 'template_jqjuo3i'
            };
            
            // Load EmailJS if not loaded
            if (typeof emailjs === 'undefined') {
                console.log('📧 Loading EmailJS script...');
                await this.loadEmailJSScript();
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            
            // Initialize EmailJS
            emailjs.init(emailJSConfig.publicKey);
            console.log('✅ EmailJS initialized');
            
            // Use EXACT template parameters
            const templateParams = {
                email: email,
                otp_code: otp,
            };
            
            console.log('📧 Sending email...');
            
            const result = await emailjs.send(
                emailJSConfig.serviceID, 
                emailJSConfig.templateID, 
                templateParams
            );
            
            console.log('✅ Email sent successfully');
            resolve({ success: true });
            
        } catch (error) {
            console.error('❌ EmailJS error:', error);
            
            // Get detailed error message
            let errorMessage = 'Unknown error';
            if (error.text) {
                try {
                    const errorObj = JSON.parse(error.text);
                    errorMessage = errorObj.message || error.text;
                } catch (e) {
                    errorMessage = error.text;
                }
            }
            
            console.error('❌ EmailJS detailed error:', errorMessage);
            resolve({ success: false, error: errorMessage });
        }
    });
}
// PASSWORD RESET SYSTEM
// FIXED PASSWORD RESET - Only sends OTP to registered emails
// FIXED PASSWORD RESET - Only sends OTP to registered emails
async sendPasswordResetOTP(email) {
    try {
        console.log('🔐 Sending password reset OTP to:', email);
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Please enter a valid email address' };
        }
        
        // Check if email exists using enhanced method
        const emailExists = await this.checkEmailExists(email);
        console.log('📧 Final email exists result:', emailExists);
        
        if (!emailExists) {
            return { 
                success: false, 
                message: 'No account found with this email address. Please check your email or register first.' 
            };
        }
        
        // Send OTP for password reset
        const otpResult = await this.sendOTP(email);
        
        if (otpResult.success) {
            // Store reset intent
            if (!this.otpStore) {
                this.otpStore = JSON.parse(localStorage.getItem('dailyDishOTP')) || {};
            }
            
            if (this.otpStore[email]) {
                this.otpStore[email].isPasswordReset = true;
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
            }
            
            return { success: true, message: 'Password reset OTP sent to your registered email' };
        } else {
            return otpResult;
        }
        
    } catch (error) {
        console.error('❌ Error sending password reset OTP:', error);
        return { success: false, message: 'Failed to send reset OTP' };
    }
}

async resetPassword(email, otp, newPassword) {
    try {
        console.log('🔐 Resetting password for:', email);
        
        if (!newPassword || newPassword.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }
        
        // Verify OTP
        const otpResult = this.verifyOTP(email, otp);
        if (!otpResult.success) {
            return otpResult;
        }
        
        // Check if this is a password reset OTP
        if (!this.otpStore[email] || !this.otpStore[email].isPasswordReset) {
            return { success: false, message: 'Invalid OTP for password reset' };
        }
        
        if (this.isFirebaseReady) {
            // Firebase password reset
            await this.auth.sendPasswordResetEmail(email);
            
            // For immediate reset, we need to reauthenticate or use admin SDK
            // For now, we'll use the reset email flow
            return { 
                success: true, 
                message: 'Password reset email sent. Please check your inbox.' 
            };
        } else {
            // localStorage password reset
            if (!this.users[email]) {
                return { success: false, message: 'User not found' };
            }
            
            this.users[email].password = btoa(newPassword);
            this.saveUsers();
            
            // Clear OTP after successful reset
            delete this.otpStore[email];
            localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
            
            return { success: true, message: 'Password reset successfully!' };
        }
        
    } catch (error) {
        console.error('❌ Error resetting password:', error);
        return { success: false, message: 'Password reset failed' };
    }
}

// GOOGLE LOGIN SYSTEM
// PROPER FIREBASE GOOGLE POPUP
// FIXED GOOGLE OAUTH WITH CORRECT REDIRECT URI
// PROPER FIREBASE GOOGLE LOGIN (AFTER ENABLING IN CONSOLE)
async loginWithGoogle() {
    try {
        console.log('🔐 Starting Google login...');
        
        if (!this.isFirebaseReady) {
            return { success: false, message: 'Google login requires Firebase' };
        }
        
        const provider = new firebase.auth.GoogleAuthProvider();
        
        // Add scopes
        provider.addScope('email');
        provider.addScope('profile');
        
        // Force account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        console.log('🔄 Starting Firebase Google popup...');
        
        // This will work once Google is enabled in Firebase Console
        const result = await this.auth.signInWithPopup(provider);
        const user = result.user;
        
        console.log('✅ Google login successful:', user.email);
        
        // Check if user exists in our database, if not create account
        const userDoc = await this.db.collection('users').doc(user.uid).get();
        
        if (!userDoc.exists) {
            await this.db.collection('users').doc(user.uid).set({
                username: user.displayName || user.email.split('@')[0],
                email: user.email,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                preferences: {},
                favorites: [],
                shoppingList: [],
                ratings: {},
                comments: [],
                emailVerified: true,
                isGoogleAccount: true,
                profilePhoto: user.photoURL || null
            });
            console.log('✅ New Google user account created');
        }
        
        // Store in localStorage for offline access
        localStorage.setItem('currentUser', user.email);
        
        // Close any open auth modals
        const authModal = document.getElementById('authModal');
        if (authModal) {
            const modal = bootstrap.Modal.getInstance(authModal);
            if (modal) modal.hide();
        }
        
        return { 
            success: true, 
            message: 'Welcome! 🎉',
            user: user.displayName || user.email.split('@')[0]
        };
        
    } catch (error) {
        console.error('❌ Google login error:', error);
        
        let errorMessage = 'Google login failed';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Google login cancelled';
        } else if (error.code === 'auth/popup-blocked') {
            errorMessage = 'Popup blocked! Please allow popups.';
        } else if (error.code === 'auth/operation-not-allowed') {
            errorMessage = 'Google sign-in is not enabled. Please contact support.';
        }
        
        return { success: false, message: errorMessage };
    }
}
async handleGoogleUserLogin(userInfo) {
    try {
        console.log('👤 Handling Google user login:', userInfo.email);
        
        const email = userInfo.email;
        
        // Check if user already exists
        let userExists = false;
        
        if (this.isFirebaseReady) {
            // For Firebase, we'll create a custom token or use the existing system
            // For now, we'll use localStorage approach
            userExists = !!this.users[email];
        } else {
            userExists = !!this.users[email];
        }
        
        if (!userExists) {
            // Create new user account
            const newUser = {
                username: userInfo.name || email.split('@')[0],
                email: email,
                joined: new Date().toISOString(),
                preferences: {},
                favorites: [],
                shoppingList: [],
                ratings: {},
                comments: [],
                emailVerified: true,
                isGoogleAccount: true,
                profilePhoto: userInfo.picture || null
            };
            
            if (this.isFirebaseReady) {
                // Store in Firestore
                const userRef = this.db.collection('users').doc();
                await userRef.set(newUser);
            } else {
                // Store in localStorage
                this.users[email] = newUser;
                this.saveUsers();
            }
            
            console.log('✅ New Google user account created');
        }
        
        // Login the user
        this.currentUser = email;
        this.userData = this.users[email] || newUser;
        localStorage.setItem('currentUser', email);
        
        // Update UI
        this.showUserMenu();
        this.updateShoppingBagCounter();
        
        console.log('✅ Google user logged in successfully');
        
    } catch (error) {
        console.error('❌ Error handling Google user login:', error);
        throw error;
    }
}
async getGoogleUserInfo(token) {
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch user info');
        }
        
        const userInfo = await response.json();
        console.log('📧 Google user info:', userInfo);
        return userInfo;
        
    } catch (error) {
        console.error('❌ Error getting Google user info:', error);
        throw error;
    }
}
// Handle Google redirect result
async handleGoogleRedirect() {
    try {
        if (!this.isFirebaseReady) return;
        
        console.log('🔄 Checking for Google redirect result...');
        const result = await this.auth.getRedirectResult();
        
        if (result.user) {
            console.log('✅ Google redirect login successful:', result.user.email);
            await this.handleGoogleLoginSuccess(result.user);
        }
    } catch (error) {
        console.error('❌ Google redirect error:', error);
        // Don't show error if it's just "no redirect pending"
        if (error.code !== 'auth/no-auth-event') {
            this.showNotification('Google login failed. Please try again.', 'error');
        }
    }
}
// Add this method to UserManager class
forceAuthSync() {
    console.log('🔄 FORCE Auth Sync called from:', window.location.pathname);
    
    if (this.auth) {
        // Immediate auth state check
        this.auth.onAuthStateChanged((user) => {
            console.log('🔄 Force Auth State Change:', user ? user.email : 'No user');
            this.currentUser = user;
            this.showUserMenu();
            this.updateShoppingBagCounter();
            
            if (user) {
                this.loadUserData(user.uid);
            }
        });
        
        // Trigger immediate check
        if (this.auth.currentUser) {
            this.currentUser = this.auth.currentUser;
            this.showUserMenu();
            this.updateShoppingBagCounter();
        }
    } else {
        console.log('🌐 No Firebase auth, using localStorage');
        this.loadCurrentUser();
        this.showUserMenu();
        this.updateShoppingBagCounter();
    }
}
 // PROPER EmailJS script loading
    loadEmailJSScript() {
        return new Promise((resolve, reject) => {
            // Check if already loading or loaded
            if (document.querySelector('script[src*="emailjs"]')) {
                console.log('📧 EmailJS script already exists');
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
            script.onload = () => {
                console.log('✅ EmailJS script loaded successfully');
                this.emailJSLoaded = true;
                resolve();
            };
            script.onerror = (error) => {
                console.error('❌ Failed to load EmailJS script:', error);
                reject(new Error('Failed to load EmailJS'));
            };
            document.head.appendChild(script);
        });
    }
    // Load external scripts
    loadScript(src) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // OTP VERIFICATION SYSTEM
    generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async sendOTP(email) {
        try {
            console.log('📧 Sending REAL OTP to:', email);
            
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return { 
                    success: false, 
                    message: 'Please enter a valid email address' 
                };
            }
            
            if (!this.otpStore) {
                this.otpStore = JSON.parse(localStorage.getItem('dailyDishOTP')) || {};
            }
            
            const otp = this.generateOTP();
            const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
            
            this.otpStore[email] = {
                otp: otp,
                expiresAt: expiresAt,
                attempts: 0,
                verified: false
            };
            
            localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
            
            console.log(`📧 OTP generated for ${email}: ${otp}`);
            
            // Show loading state
            this.showNotification('Sending OTP to your email...', 'info');
            
            // REAL EMAIL ONLY - NO DEMO FALLBACK
            const emailResult = await this.sendRealEmail(email, otp);
            
            if (emailResult.success) {
                this.showNotification(`✅ OTP sent to ${email}`, 'success');
                return { 
                    success: true, 
                    message: 'OTP sent to your email! Check your inbox.' 
                };
            } else {
                console.error('❌ Email sending failed:', emailResult.error);
                
                // Provide specific error messages
                let errorMessage = 'Failed to send OTP. ';
                
                if (emailResult.error.includes('network') || emailResult.error.includes('Network')) {
                    errorMessage += 'Please check your internet connection.';
                } else if (emailResult.error.includes('init')) {
                    errorMessage += 'Email service configuration error.';
                } else {
                    errorMessage += 'Please try again in a moment.';
                }
                
                return { 
                    success: false, 
                    message: errorMessage 
                };
            }
            
        } catch (error) {
            console.error('❌ Error in sendOTP:', error);
            return { 
                success: false, 
                message: 'Unexpected error sending OTP. Please try again.' 
            };
        }
    }
async testEmailJS() {
    try {
        console.log('🧪 Testing EmailJS configuration...');
        
        // Load EmailJS if needed
        if (typeof emailjs === 'undefined') {
            await this.loadEmailJSScript();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Test initialization
        emailjs.init('_8bV1RGk8HfzdzJjA');
        console.log('✅ EmailJS initialized for test');
        
        // Test send with dummy data
        const testParams = {
            to_email: 'test@example.com',
            otp_code: '123456',
            app_name: 'Daily Dish Test',
            expiry_time: '10 minutes'
        };
        
        const result = await emailjs.send(
            'service_xtwhihp',
            'template_roksxy4', 
            testParams
        );
        
        console.log('✅ EmailJS test successful:', result);
        return { success: true, message: 'EmailJS is working!' };
        
    } catch (error) {
        console.error('❌ EmailJS test failed:', error);
        return { 
            success: false, 
            message: `EmailJS test failed: ${error.message}` 
        };
    }
}async testEmailJS() {
    try {
        console.log('🧪 Testing EmailJS configuration...');
        
        // Load EmailJS if needed
        if (typeof emailjs === 'undefined') {
            await this.loadEmailJSScript();
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Test initialization
        emailjs.init('_8bV1RGk8HfzdzJjA');
        console.log('✅ EmailJS initialized for test');
        
        // Test send with dummy data
        const testParams = {
            to_email: 'test@example.com',
            otp_code: '123456',
            app_name: 'Daily Dish Test',
            expiry_time: '10 minutes'
        };
        
        const result = await emailjs.send(
            'service_xtwhihp',
            'template_roksxy4', 
            testParams
        );
        
        console.log('✅ EmailJS test successful:', result);
        return { success: true, message: 'EmailJS is working!' };
        
    } catch (error) {
        console.error('❌ EmailJS test failed:', error);
        return { 
            success: false, 
            message: `EmailJS test failed: ${error.message}` 
        };
    }
}

    verifyOTP(email, enteredOTP) {
        try {
            console.log('🔐 Verifying OTP for:', email);
            
            if (!this.otpStore) {
                this.otpStore = JSON.parse(localStorage.getItem('dailyDishOTP')) || {};
            }
            
            const otpData = this.otpStore[email];
            
            if (!otpData) {
                return { success: false, message: 'No OTP found. Please request a new one.' };
            }
            
            if (Date.now() > otpData.expiresAt) {
                delete this.otpStore[email];
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                return { success: false, message: 'OTP expired. Please request a new one.' };
            }
            
            if (otpData.attempts >= 3) {
                delete this.otpStore[email];
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                return { success: false, message: 'Too many attempts. Please request a new OTP.' };
            }
            
            if (otpData.otp === enteredOTP) {
                this.otpStore[email].verified = true;
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                console.log('✅ OTP verified successfully for:', email);
                return { success: true, message: 'OTP verified successfully' };
            } else {
                this.otpStore[email].attempts++;
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                const remainingAttempts = 3 - this.otpStore[email].attempts;
                return { 
                    success: false, 
                    message: `Invalid OTP. ${remainingAttempts} attempts remaining.` 
                };
            }
            
        } catch (error) {
            console.error('❌ Error verifying OTP:', error);
            return { success: false, message: 'OTP verification failed' };
        }
    }

    showLoginModal() {
    console.log('🔐 Showing login modal with OTP verification');
    
    try {
        // COMPLETE CLEANUP - Remove ALL existing modals and backdrops first
        const existingModals = document.querySelectorAll('#authModal, #passwordResetModal');
        existingModals.forEach(modal => modal.remove());
        
        const backdrops = document.querySelectorAll('.modal-backdrop');
        backdrops.forEach(backdrop => backdrop.remove());
        
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';

        const modalHtml = `
            <div class="modal fade" id="authModal" tabindex="-1" aria-labelledby="authModalLabel" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="authModalLabel">Welcome to Daily Dish</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onclick="setTimeout(() => window.location.reload(), 100)"></button>
                        </div>
                        <div class="modal-body p-4">
                            <!-- Google Login Button -->
                            <div class="text-center mb-4">
                                <button class="btn btn-outline-danger w-100 py-2" id="googleLoginBtn">
                                    <i class="fab fa-google me-2"></i>Continue with Google
                                </button>
                            </div>
                            
                            <div class="divider d-flex align-items-center my-4">
                                <p class="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
                            </div>
                            
                            <ul class="nav nav-pills nav-justified mb-4" id="authTabs" role="tablist">
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link active" id="login-tab" data-bs-toggle="pill" data-bs-target="#login" type="button" role="tab" aria-controls="login" aria-selected="true">Login</button>
                                </li>
                                <li class="nav-item" role="presentation">
                                    <button class="nav-link" id="register-tab" data-bs-toggle="pill" data-bs-target="#register" type="button" role="tab" aria-controls="register" aria-selected="false">Register</button>
                                </li>
                            </ul>
                            
                            <div class="tab-content" id="authTabsContent">
                                <div class="tab-pane fade show active" id="login" role="tabpanel" aria-labelledby="login-tab">
                                    <form id="loginForm">
                                        <div class="mb-3">
                                            <label for="loginEmail" class="form-label">Email address</label>
                                            <input type="email" class="form-control" id="loginEmail" placeholder="Enter your email" required>
                                        </div>
                                        <div class="mb-3">
                                            <label for="loginPassword" class="form-label">Password</label>
                                            <input type="password" class="form-control" id="loginPassword" placeholder="Enter your password" required>
                                        </div>
                                        <button type="submit" class="btn btn-primary w-100 py-2 mb-3">
                                            <i class="fas fa-sign-in-alt me-2"></i>Login
                                        </button>
                                        
                                        <!-- Forgot Password Link -->
                                        <div class="text-center">
                                            <button type="button" class="btn btn-link text-decoration-none p-0" id="forgotPasswordBtn">
                                                Forgot your password?
                                            </button>
                                        </div>
                                    </form>
                                </div>
                                
                                <div class="tab-pane fade" id="register" role="tabpanel" aria-labelledby="register-tab">
                                    <div id="registerStep1">
                                        <form id="registerFormStep1">
                                            <div class="mb-3">
                                                <label for="registerUsername" class="form-label">Username</label>
                                                <input type="text" class="form-control" id="registerUsername" placeholder="Choose a username" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="registerEmail" class="form-label">Email address</label>
                                                <input type="email" class="form-control" id="registerEmail" placeholder="Enter your email" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="registerPassword" class="form-label">Password</label>
                                                <input type="password" class="form-control" id="registerPassword" placeholder="Choose a password (min. 6 characters)" required minlength="6">
                                            </div>
                                            <button type="submit" class="btn btn-success w-100 py-2" id="sendOTPBtn">
                                                <i class="fas fa-paper-plane me-2"></i>Send OTP
                                            </button>
                                        </form>
                                    </div>
                                    
                                    <div id="registerStep2" style="display: none;">
                                        <div class="alert alert-info">
                                            <i class="fas fa-info-circle me-2"></i>
                                            We sent a 6-digit OTP to your email. Please check your inbox.
                                        </div>
                                        <form id="registerFormStep2">
                                            <div class="mb-3">
                                                <label for="registerOTP" class="form-label">Enter OTP</label>
                                                <input type="text" class="form-control" id="registerOTP" placeholder="Enter 6-digit OTP" maxlength="6" required>
                                            </div>
                                            <div class="d-flex gap-2">
                                                <button type="button" class="btn btn-outline-secondary flex-fill" id="backToStep1">
                                                    <i class="fas fa-arrow-left me-2"></i>Back
                                                </button>
                                                <button type="submit" class="btn btn-success flex-fill">
                                                    <i class="fas fa-check me-2"></i>Verify & Register
                                                </button>
                                            </div>
                                            <div class="mt-2 text-center">
                                                <button type="button" class="btn btn-link btn-sm" id="resendOTPBtn">
                                                    <i class="fas fa-redo me-1"></i>Resend OTP
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Password Reset Modal -->
            <div class="modal fade" id="passwordResetModal" tabindex="-1" aria-labelledby="passwordResetModalLabel" aria-hidden="true" data-bs-backdrop="static">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-warning text-dark">
                            <h5 class="modal-title" id="passwordResetModalLabel">
                                <i class="fas fa-key me-2"></i>Reset Password
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-4">
                            <div id="resetStep1">
    <p class="text-muted mb-3">Enter your email address to receive a password reset OTP.</p>
    
    <!-- ADD ERROR DISPLAY AREA -->
    <div id="resetError" class="alert alert-danger d-none" role="alert">
        <i class="fas fa-exclamation-circle me-2"></i>
        <span id="resetErrorText"></span>
    </div>
    
    <form id="resetPasswordFormStep1">
        <div class="mb-3">
            <label for="resetEmail" class="form-label">Email address</label>
            <input type="email" class="form-control" id="resetEmail" placeholder="Enter your registered email" required>
        </div>
        <button type="submit" class="btn btn-warning w-100 py-2">
            <i class="fas fa-paper-plane me-2"></i>Send Reset OTP
        </button>
    </form>
</div>
                            
                            <div id="resetStep2" style="display: none;">
                                <div class="alert alert-info">
                                    <i class="fas fa-info-circle me-2"></i>
                                    We sent a 6-digit OTP to your email for password reset.
                                </div>
                                <form id="resetPasswordFormStep2">
                                    <div class="mb-3">
                                        <label for="resetOTP" class="form-label">Enter OTP</label>
                                        <input type="text" class="form-control" id="resetOTP" placeholder="Enter 6-digit OTP" maxlength="6" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="newPassword" class="form-label">New Password</label>
                                        <input type="password" class="form-control" id="newPassword" placeholder="Enter new password (min. 6 characters)" required minlength="6">
                                    </div>
                                    <div class="d-flex gap-2">
                                        <button type="button" class="btn btn-outline-secondary flex-fill" id="backToResetStep1">
                                            <i class="fas fa-arrow-left me-2"></i>Back
                                        </button>
                                        <button type="submit" class="btn btn-success flex-fill">
                                            <i class="fas fa-check me-2"></i>Reset Password
                                        </button>
                                    </div>
                                    <div class="mt-2 text-center">
                                        <button type="button" class="btn btn-link btn-sm" id="resendResetOTPBtn">
                                            <i class="fas fa-redo me-1"></i>Resend OTP
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modals to DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        document.getElementById('googleLoginBtn').onclick = (e) => { e.preventDefault(); this.loginWithGoogle(); };

        // Login form handler
        document.getElementById('loginForm').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            const result = await this.login(email, password);
            
            if (result.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                if (modal) modal.hide();
                this.showNotification(`Welcome back, ${result.user || 'User'}! 🎉`, 'success');
            } else {
                if (result.isGoogleUser) {
                    this.showGoogleLoginHint();
                }
                this.showNotification(result.message, 'error');
            }
        };

        // Forgot Password Handler
        document.getElementById('forgotPasswordBtn').onclick = () => {
            const authModal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
            if (authModal) authModal.hide();
            
            this.showPasswordResetModal();
        };

        // Step 1: Send OTP
        document.getElementById('registerFormStep1').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const username = document.getElementById('registerUsername').value;
            const password = document.getElementById('registerPassword').value;
            
            if (!username || !email || !password) {
                this.showNotification('All fields are required', 'error');
                return;
            }
            
            if (password.length < 6) {
                this.showNotification('Password must be at least 6 characters', 'error');
                return;
            }

            const sendOTPBtn = document.getElementById('sendOTPBtn');
            sendOTPBtn.disabled = true;
            sendOTPBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending OTP...';

            const result = await this.sendOTP(email);
            
            if (result.success) {
                document.getElementById('registerStep1').style.display = 'none';
                document.getElementById('registerStep2').style.display = 'block';
                document.getElementById('registerStep2').setAttribute('data-registration-data', 
                    JSON.stringify({ username, email, password }));
            } else {
                this.showNotification(result.message, 'error');
            }
            
            sendOTPBtn.disabled = false;
            sendOTPBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send OTP';
        };

        // Step 2: Verify OTP and Register
        document.getElementById('registerFormStep2').onsubmit = async (e) => {
            e.preventDefault();
            const otp = document.getElementById('registerOTP').value;
            const registrationData = JSON.parse(document.getElementById('registerStep2').getAttribute('data-registration-data'));
            
            if (!registrationData) {
                this.showNotification('Registration data missing. Please start over.', 'error');
                return;
            }

            const verifyBtn = document.querySelector('#registerFormStep2 button[type="submit"]');
            verifyBtn.disabled = true;
            verifyBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verifying...';

            const otpResult = this.verifyOTP(registrationData.email, otp);
            
            if (otpResult.success) {
                this.otpStore[registrationData.email] = { verified: true };
                localStorage.setItem('dailyDishOTP', JSON.stringify(this.otpStore));
                
                const registerResult = await this.register(
                    registrationData.username, 
                    registrationData.email, 
                    registrationData.password
                );
                
                if (registerResult.success) {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
                    if (modal) modal.hide();
                    this.showNotification('Registration successful! Please login.', 'success');
                    document.getElementById('login-tab').click();
                    document.getElementById('registerStep1').style.display = 'block';
                    document.getElementById('registerStep2').style.display = 'none';
                    document.getElementById('registerFormStep1').reset();
                    document.getElementById('registerFormStep2').reset();
                } else {
                    this.showNotification(registerResult.message, 'error');
                }
            } else {
                this.showNotification(otpResult.message, 'error');
            }
            
            verifyBtn.disabled = false;
            verifyBtn.innerHTML = '<i class="fas fa-check me-2"></i>Verify & Register';
        };

        // Back to step 1
        document.getElementById('backToStep1').onclick = () => {
            document.getElementById('registerStep1').style.display = 'block';
            document.getElementById('registerStep2').style.display = 'none';
        };

        // Resend OTP
        document.getElementById('resendOTPBtn').onclick = async () => {
            const registrationData = JSON.parse(document.getElementById('registerStep2').getAttribute('data-registration-data'));
            if (registrationData) {
                const result = await this.sendOTP(registrationData.email);
                this.showNotification(result.message, result.success ? 'success' : 'error');
            }
        };

        // Password Reset Handlers
        document.getElementById('resetPasswordFormStep1').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            
            const errorDiv = document.getElementById('resetError');
            const errorText = document.getElementById('resetErrorText');
            errorDiv.classList.add('d-none');
            
            const resetBtn = document.querySelector('#resetPasswordFormStep1 button[type="submit"]');
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Sending OTP...';
            
            const result = await this.sendPasswordResetOTP(email);
            
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Send Reset OTP';
            
            if (result.success) {
                document.getElementById('resetStep1').style.display = 'none';
                document.getElementById('resetStep2').style.display = 'block';
                document.getElementById('resetStep2').setAttribute('data-reset-email', email);
            } else {
                errorText.textContent = result.message;
                errorDiv.classList.remove('d-none');
            }
        };

        document.getElementById('resetPasswordFormStep2').onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetStep2').getAttribute('data-reset-email');
            const otp = document.getElementById('resetOTP').value;
            const newPassword = document.getElementById('newPassword').value;
            
            const resetBtn = document.querySelector('#resetPasswordFormStep2 button[type="submit"]');
            resetBtn.disabled = true;
            resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Resetting...';
            
            const result = await this.resetPassword(email, otp, newPassword);
            
            resetBtn.disabled = false;
            resetBtn.innerHTML = '<i class="fas fa-check me-2"></i>Reset Password';
            
            if (result.success) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('passwordResetModal'));
                if (modal) modal.hide();
                this.showNotification(result.message, 'success');
                this.showLoginModal();
            } else {
                this.showNotification(result.message, 'error');
            }
        };

        document.getElementById('backToResetStep1').onclick = () => {
            document.getElementById('resetStep1').style.display = 'block';
            document.getElementById('resetStep2').style.display = 'none';
        };

        document.getElementById('resendResetOTPBtn').onclick = async () => {
            const email = document.getElementById('resetStep2').getAttribute('data-reset-email');
            if (email) {
                const result = await this.sendPasswordResetOTP(email);
                this.showNotification(result.message, result.success ? 'success' : 'error');
            }
        };

        // Show auth modal
        const modal = new bootstrap.Modal(document.getElementById('authModal'));
        modal.show();
        
    } catch (error) {
        console.error('❌ Error showing login modal:', error);
        this.showNotification('Error loading login form', 'error');
    }
}
// Add this method to your UserManager class
showGoogleLoginHint() {
    const googleBtn = document.getElementById('googleLoginBtn');
    if (googleBtn) {
        // Highlight the Google button
        googleBtn.style.border = '2px solid #dc3545';
        googleBtn.style.backgroundColor = '#fff5f5';
        
        // Add pulsing animation
        googleBtn.classList.add('pulse-animation');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            googleBtn.style.border = '';
            googleBtn.style.backgroundColor = '';
            googleBtn.classList.remove('pulse-animation');
        }, 5000);
    }
}
// Enhanced email checking method
async checkEmailExists(email) {
    try {
        console.log('🔍 Checking if email exists:', email);
        let exists = false;
        
        if (this.isFirebaseReady) {
            try {
                console.log('📧 Checking Firebase Auth for email...');
                
                // METHOD 1: Check ALL Firebase Auth users (email, Google, etc.)
                const methods = await this.auth.fetchSignInMethodsForEmail(email);
                exists = methods && methods.length > 0;
                console.log('📧 Firebase Auth methods:', methods);
                console.log('📧 Firebase Auth result:', exists ? 'EXISTS' : 'NOT FOUND');
                
                // METHOD 2: Check Firestore users collection (for registered users)
                if (!exists) {
                    console.log('📧 Checking Firestore users collection...');
                    const usersSnapshot = await this.db.collection('users')
                        .where('email', '==', email.toLowerCase().trim())
                        .limit(1)
                        .get();
                    
                    exists = !usersSnapshot.empty;
                    console.log('📧 Firestore users result:', exists ? 'EXISTS' : 'NOT FOUND');
                    
                    if (exists) {
                        console.log('📧 Found user in Firestore:', usersSnapshot.docs[0].data());
                    }
                }
                
            } catch (firebaseError) {
                console.error('❌ Firebase check error:', firebaseError);
            }
        }
        
        // METHOD 3: Check localStorage as final fallback
        if (!exists) {
            // Check with case-insensitive email matching
            const normalizedEmail = email.toLowerCase().trim();
            exists = Object.keys(this.users).some(storedEmail => 
                storedEmail.toLowerCase().trim() === normalizedEmail
            );
            console.log('📧 localStorage result:', exists ? 'EXISTS' : 'NOT FOUND');
        }
        
        console.log('📧 FINAL RESULT - Email exists:', exists);
        return exists;
        
    } catch (error) {
        console.error('❌ Error checking email existence:', error);
        return false;
    }
}
// Password Reset Modal
showPasswordResetModal() {
    try {
        // Make sure modal exists
        if (!document.getElementById('passwordResetModal')) {
            console.error('❌ Password reset modal not found');
            return;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('passwordResetModal'));
        
        // Reset the form when showing
        document.getElementById('resetStep1').style.display = 'block';
        document.getElementById('resetStep2').style.display = 'none';
        document.getElementById('resetPasswordFormStep1').reset();
        document.getElementById('resetPasswordFormStep2').reset();
        
        modal.show();
    } catch (error) {
        console.error('❌ Error showing password reset modal:', error);
        this.showNotification('Error loading password reset form', 'error');
    }
}

    showUserProfile() {
        console.log('👤 Showing user profile');
        
        if (!this.currentUser) {
            this.showNotification('Please login to view your profile', 'warning');
            this.showLoginModal();
            return;
        }

        try {
            const user = this.userData;
            const safeUsername = user?.username || (typeof this.currentUser === 'string' ? this.currentUser.split('@')[0] : this.currentUser.email?.split('@')[0]) || 'User';
            const safeEmail = typeof this.currentUser === 'string' ? this.currentUser : this.currentUser.email;

            const favorites = this.getFavorites();
            const shoppingList = this.getShoppingList();

            const profileHtml = `
                <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content" style="border-radius: 15px; border: none; box-shadow: 0 20px 60px rgba(0,0,0,0.1);">
                            <div class="modal-header" style="background: linear-gradient(135deg, #FFB524, #ff8c42); border: none; border-radius: 15px 15px 0 0;">
                                <h5 class="modal-title text-white fw-bold" id="profileModalLabel">
                                    <i class="fas fa-user-circle me-2"></i>Welcome back, ${safeUsername}!
                                </h5>
                                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body p-4">
                                <div class="row mb-4">
                                    <div class="col-12">
                                        <div class="card border-0 shadow-sm">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-primary mb-3">
                                                    <i class="fas fa-info-circle me-2"></i>Account Information
                                                </h6>
                                                <div class="row">
                                                    <div class="col-md-6">
                                                        <p class="mb-2"><strong>Email:</strong> ${safeEmail}</p>
                                                    </div>
                                                    <div class="col-md-6">
                                                        <p class="mb-0"><strong>Member since:</strong> ${user?.joined ? new Date(user.joined).toLocaleDateString() : 'Recently'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="row mb-4">
                                    <div class="col-md-6 mb-3 mb-md-0">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-primary mb-3">
                                                    <i class="fas fa-heart me-2"></i>Saved & Favorite Recipes (${favorites.length})
                                                </h6>
                                                <div class="favorites-list" style="max-height: 200px; overflow-y: auto;">
                                                    ${favorites.length > 0 ? 
                                                        favorites.map((fav, index) => `
                                                            <div class="d-flex justify-content-between align-items-center border-bottom py-2 favorite-item" data-dish-id="${fav.id}">
                                                                <span class="text-dark">${fav.name}</span>
                                                                <button class="btn btn-sm btn-outline-danger remove-favorite-btn" 
                                                                        data-dish-id="${fav.id}" data-dish-name="${fav.name}">
                                                                    <i class="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        `).join('') 
                                                        : '<p class="text-muted text-center py-3"><i class="fas fa-heart-broken me-2"></i>No Saved Or favorites yet</p>'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="card border-0 shadow-sm h-100">
                                            <div class="card-body">
                                                <h6 class="fw-bold text-primary mb-3">
                                                    <i class="fas fa-shopping-bag me-2"></i>Shopping List (${shoppingList.length})
                                                </h6>
                                                <div class="shopping-list" style="max-height: 200px; overflow-y: auto;">
                                                    ${shoppingList.length > 0 ? 
                                                        shoppingList.map((item, index) => `
                                                            <div class="d-flex justify-content-between align-items-center border-bottom py-2 cart-item" data-item-index="${index}">
                                                                <span class="text-dark">${item.name}</span>
                                                                <button class="btn btn-sm btn-outline-danger remove-cart-item-btn" 
                                                                        data-item-index="${index}" data-item-name="${item.name}">
                                                                    <i class="fas fa-times"></i>
                                                                </button>
                                                            </div>
                                                        `).join('') 
                                                        : '<p class="text-muted text-center py-3"><i class="fas fa-shopping-basket me-2"></i>No items in shopping list</p>'
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer" style="border: none; background: #f8f9fa; border-radius: 0 0 15px 15px;">
                                <button class="btn custom-logout-btn" onclick="userManager.logout()">
                                    <i class="fas fa-sign-out-alt me-2"></i>Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if any
            const existingModal = document.getElementById('profileModal');
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to DOM
            document.body.insertAdjacentHTML('beforeend', profileHtml);
            
            // Add event handlers
            setTimeout(() => {
                this.attachFavoriteRemoveHandlers();
                
                // Cart item removal
                document.querySelectorAll('.remove-cart-item-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const itemIndex = parseInt(e.target.closest('button').getAttribute('data-item-index'));
                        const itemName = e.target.closest('button').getAttribute('data-item-name');
                        
                        console.log('🗑️ Removing cart item:', itemIndex, itemName);
                        this.removeFromShoppingList(itemIndex);
                    });
                });
            }, 100);

            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('profileModal'));
            modal.show();
            
        } catch (error) {
            console.error('❌ Error showing user profile:', error);
            this.showNotification('Error loading profile', 'error');
        }
    }
// Review system
addReview(dish, rating, comment, userName, userEmail) {
    console.log('⭐ Adding review for:', dish?.name);
    
    if (!this.currentUser) {
        this.showNotification('Please login to submit reviews', 'warning');
        return false;
    }

    if (!dish || !dish.id || rating < 1 || rating > 5 || !comment.trim()) {
        console.error('❌ Invalid review data');
        return false;
    }

    try {
        const reviewData = {
            dishId: dish.id,
            dishName: dish.name,
            rating: rating,
            comment: comment.trim(),
            userName: userName,
            userEmail: userEmail,
            userId: this.isFirebaseReady ? this.currentUser.uid : this.currentUser,
            timestamp: new Date().toISOString()
        };

        if (this.isFirebaseReady) {
            // Firebase version
            const reviewRef = this.db.collection('reviews').doc();
            reviewRef.set(reviewData);
        } else {
            // LocalStorage version
            if (!this.comments[dish.id]) {
                this.comments[dish.id] = [];
            }
            this.comments[dish.id].push(reviewData);
            localStorage.setItem('dailyDishComments', JSON.stringify(this.comments));
        }

        return true;
        
    } catch (error) {
        console.error('❌ Error adding review:', error);
        return false;
    }
}

getDishReviews(dishId) {
    if (!dishId) return [];

    try {
        if (this.isFirebaseReady) {
            // Would need to query Firebase reviews collection
            // For now, use localStorage fallback
            return this.comments[dishId] || [];
        } else {
            return this.comments[dishId] || [];
        }
    } catch (error) {
        console.error('❌ Error getting dish reviews:', error);
        return [];
    }
}
    async removeFromShoppingList(itemIndex) {
    console.log('🗑️ Removing item from shopping list at index:', itemIndex);
    
    if (!this.currentUser) {
        this.showNotification('Please login to manage shopping list', 'warning');
        return false;
    }

    try {
        let removedItem = null;
        let shoppingList = [];

        if (this.isFirebaseReady && this.currentUser.uid) {
            // FIREBASE VERSION
            const userRef = this.db.collection('users').doc(this.currentUser.uid);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                console.error('❌ User document not found in Firestore');
                return false;
            }

            const userData = userDoc.data();
            shoppingList = userData.shoppingList || [];
            
            if (itemIndex >= 0 && itemIndex < shoppingList.length) {
                removedItem = shoppingList[itemIndex];
                shoppingList.splice(itemIndex, 1);
                
                await userRef.update({ shoppingList });
                await this.loadUserData(this.currentUser.uid);
            }
            
        } else {
            // LOCALSTORAGE VERSION
            shoppingList = this.userData.shoppingList || [];
            
            if (itemIndex >= 0 && itemIndex < shoppingList.length) {
                removedItem = shoppingList[itemIndex];
                shoppingList.splice(itemIndex, 1);
                
                this.userData.shoppingList = shoppingList;
                
                // Update users data
                if (typeof this.currentUser === 'string') {
                    this.users[this.currentUser] = this.userData;
                    this.saveUsers();
                }
            }
        }

        if (removedItem) {
            this.showNotification(`🗑️ ${removedItem.name} removed from cart`, 'info');
            this.updateShoppingBagCounter();
            
            // PROPERLY UPDATE THE SHOPPING LIST IN PROFILE MODAL
            this.updateProfileModalShoppingList(shoppingList);
            
            return true;
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error removing from shopping list:', error);
        this.showNotification('Failed to remove item from cart', 'error');
        return false;
    }
}

    // Add this function to update the heart icon when favorites are removed
    updateFavoriteIcons() {
        try {
            const favorites = this.getFavorites();
            
            // Update all heart buttons on the page
            document.querySelectorAll('.btn-outline-danger, .btn-danger').forEach(btn => {
                const dishId = parseInt(btn.getAttribute('data-dish-id'));
                if (dishId) {
                    const isFavorite = favorites.some(fav => fav.id === dishId);
                    
                    if (isFavorite) {
                        btn.classList.remove('btn-outline-danger');
                        btn.classList.add('btn-danger');
                        btn.innerHTML = '<i class="fas fa-heart"></i>';
                    } else {
                        btn.classList.remove('btn-danger');
                        btn.classList.add('btn-outline-danger');
                        btn.innerHTML = '<i class="fas fa-heart"></i>';
                    }
                }
            });
            
            console.log('✅ Updated favorite icons');
        } catch (error) {
            console.error('❌ Error updating favorite icons:', error);
        }
    }

    // INSTANT helper function for nuclear button script
    toggleFavoriteFromButton(dishId) {
    console.log('❤️ INSTANT Toggle favorite from button:', dishId);
    
    // Get current state BEFORE toggling for visual reset
    const dish = window.findDishById ? window.findDishById(dishId) : null;
    if (!dish) {
        console.error('❌ Dish not found for ID:', dishId);
        return false;
    }
    
    // Check current favorite state
    const wasFavorite = this.isFavorite(dish);
    
    const result = this.toggleFavorite(dish);
    
    // If login was cancelled and user is still not logged in, reset visual state
    if (result === false && !this.currentUser) {
        console.log('🔄 Resetting favorite button visual state');
        this.updateFavoriteButton(dishId, wasFavorite);
    }
    
    return result;
}
createDefaultUserData() {
    // FIX: Check if currentUser is string before using split
    let username = 'User';
    let email = 'user@example.com';
    
    if (typeof this.currentUser === 'string') {
        username = this.currentUser.split('@')[0];
        email = this.currentUser;
    } else if (this.currentUser && this.currentUser.email) {
        username = this.currentUser.email.split('@')[0];
        email = this.currentUser.email;
    }
    
    return {
        username: username,
        email: email,
        joined: new Date().toISOString(),
        preferences: {},
        favorites: [],
        shoppingList: [],
        ratings: {},
        comments: []
    };
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

    getNotificationIcon(type) {
        const icons = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // UTILITY METHODS
    saveUsers() {
        try {
            localStorage.setItem('dailyDishUsers', JSON.stringify(this.users));
            console.log('💾 Users saved to localStorage');
        } catch (error) {
            console.error('❌ Error saving users:', error);
        }
    }

    // Initialize the class
    static initialize() {
        if (!window.userManager) {
            window.userManager = new UserManager();
            console.log('🎉 UserManager initialized successfully!');
        }
        return window.userManager;
    }
}

// Auto-initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('📄 DOM Content Loaded - Initializing UserManager');
        UserManager.initialize();
    });
} else {
    console.log('📄 DOM Already Loaded - Initializing UserManager Immediately');
    UserManager.initialize();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}