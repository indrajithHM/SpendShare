import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

   apiKey: "AIzaSyDK0ALSxU33YCG2OsxBJ9wLJSOrqFo_vXg",
  authDomain: "spendshare-app.firebaseapp.com",
  databaseURL: "https://spendshare-app-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "spendshare-app",
  storageBucket: "spendshare-app.firebasestorage.app",
  messagingSenderId: "373620895050",
  appId: "1:373620895050:web:38aa3b61680692b5a025b3"
};

const app = initializeApp(firebaseConfig);

// ✅ THESE EXPORTS WERE MISSING
export const auth = getAuth(app);
export const db = getDatabase(app);
