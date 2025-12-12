import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Direct Firebase config (hard-coded)
const firebaseConfig = {
  apiKey: "AIzaSyBUs8cb9Mfhr81b3QlVnJRDGIf7Se9QF5M",
  authDomain: "onshoper-web.firebaseapp.com",
  projectId: "onshoper-web",
  storageBucket: "onshoper-web.firebasestorage.app",
  messagingSenderId: "1012627011874",
  appId: "1:1012627011874:web:6ee19a16b70dc076c1cd7b",
  measurementId: "G-TFBVEK0T65",
};

// ✅ Initialize only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;

export { app, analytics };
