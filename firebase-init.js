// Firebase v8 Compat — works with script tag CDN (no npm/bundler needed)
// Project: leo-house-website (firebase.google.com)
// Realtime Database rules must be set to allow read/write:
//   { "rules": { ".read": true, ".write": true } }

const firebaseConfig = {
    apiKey: "AIzaSyCvRWFxu9amir1-TqTTvKoHv4IoP6Lb9AE",
    authDomain: "leo-house-ba69a.firebaseapp.com",
    databaseURL: "https://leo-house-ba69a-default-rtdb.firebaseio.com",
    projectId: "leo-house-ba69a",
    storageBucket: "leo-house-ba69a.firebasestorage.app",
    messagingSenderId: "121853485056",
    appId: "1:121853485056:web:4dd4ae0beb94648eec38e5",
    measurementId: "G-DVWRT6Z0E0"
};

// Initialize Firebase (v8 compat)
let db;
let usingFirebase = false;

try {
    if (typeof firebase !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.databaseURL) {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
        usingFirebase = true;
        console.log("Firebase Realtime Database initialized successfully.");
    }
} catch (err) {
    console.warn("Firebase initialization failed. Falling back to local storage.", err);
}

if (!usingFirebase) {
    console.log("Running in LocalStorage fallback mode (no active Firebase database).");
    
    // Create a mock Firebase Database API using localStorage
    db = {
        ref: function(path) {
            return {
                on: function(event, callback, errorCallback) {
                    if (event === 'value') {
                        // Read from localStorage
                        const data = localStorage.getItem(path);
                        const parsedData = data ? JSON.parse(data) : null;
                        
                        // Simulate asynchronous database retrieval
                        setTimeout(() => {
                            callback({
                                val: () => parsedData
                            });
                        }, 50);
                    }
                },
                set: function(value) {
                    localStorage.setItem(path, JSON.stringify(value));
                    return Promise.resolve();
                }
            };
        }
    };
}

