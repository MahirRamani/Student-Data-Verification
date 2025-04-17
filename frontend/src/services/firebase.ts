// Import the functions you need from the SDKs you need |
import { initializeApp } from "firebase/app";
import "firebase/compat/auth";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration |
const firebaseConfig = {
  apiKey: import.meta.env.apiKey,
  authDomain: import.meta.env.authDomain,
  projectId: import.meta.env.projectId,
  storageBucket: import.meta.env.storageBucket,
  messagingSenderId: import.meta.env.messagingSenderId,
  appId: import.meta.env.appId,
};

console.log("Firebase config:", firebaseConfig);


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
