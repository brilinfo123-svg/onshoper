// /pages/_app.tsx
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import DefaultHeader from "@/components/DefaultHeader/Index";
import { NotificationProvider } from '../contexts/NotificationContext';
import { FilterProvider } from "@/contexts/FilterContext"; 
import { CityFilterProvider } from "@/contexts/CityFilterContext";
import { FavoriteProvider } from '../contexts/FavoriteContext';
import { ChatProvider } from '@/contexts/ChatContext';
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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

  // ✅ Initialize OneSignal for web push notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js";
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        window.OneSignal = window.OneSignal || [];
        window.OneSignal.push(async function () {
          await window.OneSignal.init({
            appId: "1b2aa8e0-16d9-46b8-8393-aee12c888950", // Replace with your OneSignal App ID
            allowLocalhostAsSecureOrigin: true,
            notifyButton: {
              enable: true, // Show the default subscribe button
            },
          });
        });
      };
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
                {!isAdminPage && <MobileBottomNav />}
              </FilterProvider>
            </CityFilterProvider>
          </ChatProvider>
        </FavoriteProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

// Show different headers based on session
const HeaderComponent = () => {
  const { data: session } = useSession();
  return session ? <ProtectedHeader /> : <DefaultHeader />;
};

// Auto poll /api/unfeature-expired
const AutoUnfeaturePoller = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("../api/unfeature-expired");
    }, 86400000); // every 1 day
    return () => clearInterval(interval);
  }, []);
  return null;
};
