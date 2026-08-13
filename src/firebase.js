import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// 🔧 Replace with your Firebase project config
// Get from: Firebase Console → Project Settings → Your Apps → Web App
const firebaseConfig = {
    apiKey: "AIzaSyCq2ComHi4yO5TyqAjAFObTXn572plQnpg",
    authDomain: "security-85533.firebaseapp.com",
    projectId: "security-85533",
    storageBucket: "security-85533.firebasestorage.app",
    messagingSenderId: "139024014339",
    appId: "1:139024014339:web:e9094e754b59f512de4236",
    measurementId: "G-38BKBK4GX6"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export default app;
