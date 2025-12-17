// ---------------------------------------------------------
// Firebase Messaging setup (unchanged)
// ---------------------------------------------------------
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBUs8cb9Mfhr81b3QlVnJRDGIf7Se9QF5M",
  authDomain: "onshoper-web.firebaseapp.com",
  projectId: "onshoper-web",
  storageBucket: "onshoper-web.firebasestorage.app",
  messagingSenderId: "1012627011874",
  appId: "1:1012627011874:web:6ee19a16b70dc076c1cd7b",
  measurementId: "G-TFBVEK0T65",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification?.title || 'Background Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: 'https://onshoper.com/icons/logoMY.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ---------------------------------------------------------
// Offline fallback logic (new)
// ---------------------------------------------------------
const OFFLINE_URL = "/_offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("offline-cache").then((cache) => {
      return cache.addAll([OFFLINE_URL]); // cache offline page
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  }
});
