// This file initializes the Firebase CLIENT SDK
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// --- IMPORTANT ---
// You MUST get these values from your Firebase project console.
// Project Settings -> General -> Your apps -> Click the (</>) icon
const firebaseConfig = {
  apiKey: "AIzaSyARGHwuAigHV9yNMEYiJ1eyvy_s8-Ky-VA",
  authDomain: "kanri-923d1.firebaseapp.com",
  projectId: "kanri-923d1",
  storageBucket: "kanri-923d1.appspot.com",
  messagingSenderId: "787454418084",
  appId: "1:787454418084:web:af5650f5d7627a50699a31"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the Firestore database instance
export const db = getFirestore(app);
