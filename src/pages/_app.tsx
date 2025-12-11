// /pages/_app.tsx
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import DefaultHeader from "@/components/DefaultHeader/Index";
import { NotificationProvider } from "../contexts/NotificationContext";
import { FilterProvider } from "@/contexts/FilterContext";
import { CityFilterProvider } from "@/contexts/CityFilterContext";
import { FavoriteProvider } from "../contexts/FavoriteContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ProtectedHeader from "@/components/ProtectedHeader/Index";
import Footer from "@/components/Footer/Index";
import { ToastContainer } from "react-toastify";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/styles/globals.css";
import "@/styles/fontFamily/stylesheet.css";
import "@/styles/fontello/css/fontello.css";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import MobileBottomNav from "@/components/MobileBottomNav/Index";
import { useRouter } from "next/router";

// ✅ Firebase imports
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { firebaseConfig } from "@/lib/firebaseConfig";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  const isProductDetailPage = router.pathname.startsWith("/product/");

  // ✅ Initialize Firebase + FCM once
  useEffect(() => {
    const initFirebase = async () => {
      try {
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);

        // ✅ Register service worker
        if ("serviceWorker" in navigator) {
          try {
            const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
            console.log("✅ Service Worker registered:", registration);
          } catch (err) {
            console.error("❌ Service Worker registration failed:", err);
          }
        }

        // Ask for notification permission
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          try {
            const token = await getToken(messaging, {
              vapidKey: "BK3EVjP3U2u-53JWg3f2stmLlHy5tXBHAzf8k9VqxEmV6sd5n0Kku6lAJS0SQ13kwLuP6H85XskltUb5ynR4xkA", // 👈 Replace with your Firebase Web Push certificate key
              serviceWorkerRegistration: await navigator.serviceWorker.ready, // 👈 ensure token binds to registered SW
            });
            console.log("✅ FCM Token:", token);

            // Save token to backend for this user
            await fetch("/api/save-fcm-token", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token }),
            });
          } catch (err) {
            console.error("❌ FCM token error:", err);
          }
        }

        // Foreground messages
        onMessage(messaging, (payload) => {
          console.log("📩 Foreground message received:", payload);
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: "/icon.png",
          });
        });
      } catch (err) {
        console.error("❌ Firebase init failed:", err);
      }
    };

    initFirebase();
  }, []);

  return (
    <SessionProvider session={pageProps.session}>
      <NotificationProvider>
        <FavoriteProvider>
          <ChatProvider>
            <CityFilterProvider>
              <FilterProvider>
                <ToastContainer position="top-right" autoClose={3000} />
                <AutoUnfeaturePoller />

                {!isAdminPage && <HeaderComponent />}

                <main>
                  <Component {...pageProps} />
                </main>

                {!isAdminPage && <Footer />}
                {!isAdminPage && !isProductDetailPage && <MobileBottomNav />}
              </FilterProvider>
            </CityFilterProvider>
          </ChatProvider>
        </FavoriteProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

// -----------------------------------------------------------------
// Header Component
// -----------------------------------------------------------------
const HeaderComponent = () => {
  const { data: session } = useSession();
  return session ? <ProtectedHeader /> : <DefaultHeader />;
};

// -----------------------------------------------------------------
// Auto poll /api/unfeature-expired
// -----------------------------------------------------------------
const AutoUnfeaturePoller = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("../api/unfeature-expired");
    }, 86400000);
    return () => clearInterval(interval);
  }, []);
  return null;
};
