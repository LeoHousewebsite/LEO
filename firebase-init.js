// Firebase v8 Compat — works with script tag CDN (no npm/bundler needed)
// Project: leo-house-website (firebase.google.com)
// Realtime Database rules must be set to allow read/write:
//   { "rules": { ".read": true, ".write": true } }

const firebaseConfig = {
    apiKey: "AIzaSyAfUqwxWDfMvmFcncf5o0ku42fwei-5Mxc",
    authDomain: "leo-house-website.firebaseapp.com",
    databaseURL: "https://leo-house-website-default-rtdb.firebaseio.com",
    projectId: "leo-house-website",
    storageBucket: "leo-house-website.firebasestorage.app",
    messagingSenderId: "410289174698",
    appId: "1:410289174698:web:5962ac15fbd3d87cbd78d3",
    measurementId: "G-3FQKS44PBN"
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

