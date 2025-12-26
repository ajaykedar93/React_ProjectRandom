// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCG1_QBx0NfyagCrd2Pw83pZsqwHjiP7_s",
  authDomain: "calculator-messenger-c05c8.firebaseapp.com",
  projectId: "calculator-messenger-c05c8",

  // ✅ IMPORTANT: Most Firebase projects use *.appspot.com
  // If Firebase console shows different bucket name, use that exact one.
  storageBucket: "calculator-messenger-c05c8.appspot.com",

  messagingSenderId: "579044548854",
  appId: "1:579044548854:web:fb71fa4e7aacf16ba6ccd7",
};

// ✅ Prevent re-initialize in React hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// ✅ Auth
export const auth = getAuth(app);

// ✅ Keep login on same device (2nd time direct secret code → messenger open)
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn("Firebase persistence error:", err?.message || err);
});

// ✅ Firestore + Storage
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
