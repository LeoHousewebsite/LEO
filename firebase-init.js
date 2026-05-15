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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();
