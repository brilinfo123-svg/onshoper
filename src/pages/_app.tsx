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
import OneSignal from "react-onesignal";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  const isProductDetailPage = router.pathname.startsWith("/product/");

  // ✅ Initialize OneSignal once
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal: any) {
        await OneSignal.init({
          appId: "e9e306bb-c8ab-4d1a-9723-5749d4300f2f", // replace with your real appId
          notifyButton: {
            enable: true,
            prenotify: true,
            showCredit: false,
            position: "bottom-right",
            size: "medium",
            text: {
              'tip.state.unsubscribed': 'Subscribe to notifications',
              'tip.state.subscribed': 'You are subscribed',
              'tip.state.blocked': 'Notifications blocked',
              'message.prenotify': 'Click to subscribe to notifications',
              'message.action.subscribed': 'Thanks for subscribing!',
              'message.action.resubscribed': 'You have resubscribed',
              'message.action.unsubscribed': 'You will not receive notifications',
              'dialog.main.title': 'Manage Notifications',
              'dialog.main.button.subscribe': 'Subscribe',
              'dialog.main.button.unsubscribe': 'Unsubscribe',
            },
          },
        });
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
      fetch("../api/unfeature-expired");
    }, 86400000);
    return () => clearInterval(interval);
  }, []);
  return null;
};
