importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDK0ALSxU33YCG2OsxBJ9wLJSOrqFo_vXg",
  authDomain: "spendshare-app.firebaseapp.com",
  projectId: "spendshare-app",
  messagingSenderId: "373620895050",
  appId: "1:373620895050:web:38aa3b61680692b5a025b3"
});

const messaging = firebase.messaging();