importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

/* ========= INITIALIZE FIREBASE ========= */
firebase.initializeApp({
  apiKey: "AIzaSyDK0ALSxU33YCG2OsxBJ9wLJSOrqFo_vXg",
  authDomain: "spendshare-app.firebaseapp.com",
  projectId: "spendshare-app",
  messagingSenderId: "373620895050",
  appId: "1:373620895050:web:38aa3b61680692b5a025b3"
});

const messaging = firebase.messaging();

/* ========= HANDLE BACKGROUND NOTIFICATION ========= */
messaging.onBackgroundMessage(function (payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "https://spendshare-app.web.app/SpendShare.png",
    data: payload.notification.data || {}
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

/* ========= HANDLE NOTIFICATION CLICK ========= */
self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const url = event.notification.data?.url || "https://spendshare-app.web.app";

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then(function (clientList) {

      // If app already open → navigate same tab
      for (const client of clientList) {
        if (client.url.includes("spendshare-app.web.app") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});