// Use Firebase v8 compat scripts for service worker
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyBUs8cb9Mfhr81b3QlVnJRDGIf7Se9QF5M",
  authDomain: "onshoper-web.firebaseapp.com",
  projectId: "onshoper-web",
  storageBucket: "onshoper-web.firebasestorage.app",
  messagingSenderId: "1012627011874",
  appId: "1:1012627011874:web:6ee19a16b70dc076c1cd7b",
});

const messaging = firebase.messaging();

// ✅ Background push listener
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/icon.png",
  });
});
