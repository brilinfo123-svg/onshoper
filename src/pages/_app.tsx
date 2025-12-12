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

// ✅ Import helper functions for FCM
import { generateToken, listenForMessages } from "@/lib/firebase"; 

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  const isProductDetailPage = router.pathname.startsWith("/product/");

  useEffect(() => {
    const initFirebaseMessaging = async () => {
      try {
        const token = await generateToken();
        if (token) {
          console.log("✅ FCM Token:", token);
          // 👉 yaha tum token ko apne backend /api/saveToken pe bhej sakte ho
        }
        // ✅ Foreground listener attach karo
        listenForMessages();
      } catch (err) {
        console.error("❌ FCM init failed:", err);
      }
    };

    initFirebaseMessaging();

    // ✅ Register service worker for background notifications
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log("✅ Service Worker registered:", registration);
        })
        .catch((err) => {
          console.error("❌ Service Worker registration failed:", err);
        });
    }
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
      fetch("/api/unfeature-expired");
    }, 86400000);
    return () => clearInterval(interval);
  }, []);
  return null;
};
