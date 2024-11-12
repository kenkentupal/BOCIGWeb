import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  collection,
  getDocs,
} from "firebase/firestore";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAQW87P2nBfvOX4AbCWoOuG5C650y5v5Kk",
  authDomain: "facialrecognition-4bee2.firebaseapp.com",
  databaseURL: "https://facialrecognition-4bee2-default-rtdb.firebaseio.com",
  projectId: "facialrecognition-4bee2",
  storageBucket: "facialrecognition-4bee2.appspot.com",
  messagingSenderId: "472138979010",
  appId: "1:472138979010:web:e2be00ae7085bc6cb5f54d5b",
  measurementId: "G-WJ8BY9M9T8",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Connect to Firestore Emulator if in development environment

export { auth, db, functions, collection, getDocs };
