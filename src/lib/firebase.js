// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBUs8cb9Mfhr81b3QlVnJRDGIf7Se9QF5M",
  authDomain: "onshoper-web.firebaseapp.com",
  projectId: "onshoper-web",
  storageBucket: "onshoper-web.firebasestorage.app",
  messagingSenderId: "1012627011874",
  appId: "1:1012627011874:web:6ee19a16b70dc076c1cd7b",
  measurementId: "G-TFBVEK0T65",
};

// ✅ Initialize Firebase app only once
const app = initializeApp(firebaseConfig);

// ✅ Messaging should only be initialized in the browser
let messaging = null;
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.warn("⚠️ Messaging init failed:", err);
  }
}

// ✅ Helper to generate FCM token safely
// src/lib/firebase.js
export const generateToken = async () => {
  try {
    if (!messaging) return null;
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, { vapidKey: "BK3EVjP3U2u-53JWg3f2stmLlHy5tXBHAzf8k9VqxEmV6sd5n0Kku6lAJS0SQ13kwLuP6H85XskltUb5ynR4xkA" });
      return token; // ✅ no console.log here
    }
    return null;
  } catch (err) {
    console.error("❌ Error generating FCM token:", err);
    return null;
  }
};


// ✅ Foreground message listener
export const listenForMessages = () => {
  if (!messaging) return;
  onMessage(messaging, (payload) => {
    console.log("📩 Foreground message received:", payload);
    new Notification(payload.notification?.title || "New Message", {
      body: payload.notification?.body,
      icon: "/icon.png",
    });
  });
};

export { app, messaging };
