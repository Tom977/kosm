// 🔥 Konfiguracja Firebase (Podmień na swoje dane)
const firebaseConfig = {
    apiKey: "AIzaSyCVU7Pjk4YRU6vVEJwzv7SM4IIUZmKN2zY",
    authDomain: "baza-fd5c7.firebaseapp.com",
    databaseURL: "https://baza-fd5c7-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "baza-fd5c7",
    storageBucket: "baza-fd5c7.firebasestorage.app",
    messagingSenderId: "163781159447",
    appId: "1:163781159447:web:1c45b963166b20478aca52",
    measurementId: "G-D3L3X9GT6C"
};

// 🔥 Inicjalizacja Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
console.log("✅ Firebase został poprawnie zainicjalizowany!");