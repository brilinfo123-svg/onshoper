// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// Replace 10.13.2 with latest version of the Firebase JS SDK.
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
firebase.initializeApp({
  apiKey: "AIzaSyBUs8cb9Mfhr81b3QlVnJRDGIf7Se9QF5M",
  authDomain: "onshoper-web.firebaseapp.com",
  projectId: "onshoper-web",
  storageBucket: "onshoper-web.firebasestorage.app",
  messagingSenderId: "1012627011874",
  appId: "1:1012627011874:web:6ee19a16b70dc076c1cd7b",
  measurementId: "G-TFBVEK0T65",
});

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  // ✅ Customize notification here using payload data
  const notificationTitle = payload.notification?.title || 'Background Message';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new message.',
    icon: '/icons/logoMY.png', // 👈 replace with your app icon if needed
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
