// Import the functions you need from the SDKs you need |
import { initializeApp } from "firebase/app";
import "firebase/compat/auth";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration |
const firebaseConfig = {
  apiKey: "AIzaSyCUXBnKLmeRHZpPC7ns4BUiP-N2fRItkbo",
  authDomain: "otp-auth-abd60.firebaseapp.com",
  projectId: "otp-auth-abd60",
  storageBucket: "otp-auth-abd60.firebasestorage.app",
  messagingSenderId: "193572590598",
  appId: "1:193572590598:web:6d1b93cac3f3acf3651f87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
