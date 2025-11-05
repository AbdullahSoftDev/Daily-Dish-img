// 🔥 Firebase Configuration - YOUR REAL CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyBLbKi6o3S6butuuSsW2TdfewBm3AtBohg",
  authDomain: "daily-dish-app.firebaseapp.com",
  projectId: "daily-dish-app",
  storageBucket: "daily-dish-app.firebasestorage.app",
  messagingSenderId: "1070129699117",
  appId: "1:1070129699117:web:d535f5eee001d132661ba4",
  measurementId: "G-Z9M2CVB9MX"
};
async function migrateUserToAuth(email, password, userData) {
    try {
        // Create user in Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update user profile with data from Firestore
        await user.updateProfile({
            displayName: userData.displayName || userData.name
        });
        
        // You might also want to update your Firestore document with the auth UID
        await firebase.firestore().collection('users').doc(user.uid).set({
            ...userData,
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        console.log('✅ User migrated to Firebase Auth:', email);
        return user;
    } catch (error) {
        console.error('❌ Migration error:', error);
        throw error;
    }
}

// Initialize Firebase
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase initialized successfully!');
    } else {
        console.error('❌ Firebase SDK not loaded');
    }
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
}