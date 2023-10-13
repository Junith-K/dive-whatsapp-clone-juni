// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBOdtujdJ50lB63ZMO3yGn5XLaHnJGhRL8",
  authDomain: "whasapp-1e278.firebaseapp.com",
  projectId: "whasapp-1e278",
  storageBucket: "whasapp-1e278.appspot.com",
  messagingSenderId: "536519944851",
  appId: "1:536519944851:web:f5a0573639f8570ceb3b66",
  databaseURL:"https://whasapp-1e278-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const database = getDatabase(app);

export default app;