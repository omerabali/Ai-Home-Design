// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("🔥 Firebase Config:", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? "PRESENT" : "MISSING" });

// Initialize Firebase with error handling
let app;
let auth;
let db;
let storage;

try {
    if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes("PLACEHOLDER")) {
        throw new Error("Firebase API Key is missing or invalid (PLACEHOLDER detected)");
    }
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    console.log("✅ Firebase initialized successfully");
} catch (error) {
    // console.error("❌ Firebase initialization failed:", error.message);
    console.log("ℹ️ Firebase not configured. Starting in Guest Mode.");
    console.log("⚠️ Authentication and Database features are disabled.");

    // Mock objects to prevent crash
    auth = {
        currentUser: null,
        onAuthStateChanged: (cb) => cb(null),
        signInWithEmailAndPassword: () => Promise.reject("Firebase not configured"),
        signOut: () => Promise.resolve()
    };
    db = {};
    storage = {};
}

export { auth, db, storage };
