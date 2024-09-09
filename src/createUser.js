// createUser.js
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQW87P2nBfvOX4AbCWoOuG5C650y5v5Kk",
  authDomain: "facialrecognition-4bee2.firebaseapp.com",
  projectId: "facialrecognition-4bee2",
  storageBucket: "facialrecognition-4bee2.appspot.com",
  messagingSenderId: "472138979010",
  appId: "1:472138979010:web:e2be00ae7085bc6cb5f54d5b",
  measurementId: "G-WJ8BY9M9T8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to create a new user
export const createNewUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("User created:", user);
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};
