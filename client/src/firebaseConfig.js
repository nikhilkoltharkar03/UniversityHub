// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";

// const firebaseConfig = {
//   apiKey: "AIzaSyDnc0TB983NgIpUeqoubIP2RpVQJkPLARk",
//   authDomain: "university-hub-d9dcd.firebaseapp.com",
//   projectId: "university-hub-d9dcd",
//   storageBucket: "university-hub-d9dcd.firebasestorage.app",
//   messagingSenderId: "19096864028",
//   appId: "1:19096864028:web:ad3053cea16bbc7a1a26d9"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);




import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);