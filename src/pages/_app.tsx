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
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "e9e306bb-c8ab-4d1a-9723-5749d4300f2f", // replace with your real appId
          allowLocalhostAsSecureOrigin: true,
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
              "dialog.blocked.message": "",
              "dialog.blocked.title": "",
              "message.action.subscribing": ""
            },
          },
        });
        console.log("✅ OneSignal initialized");
      } catch (err) {
        console.error("❌ OneSignal init failed:", err);
      }
    };

    initOneSignal();
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

  // ✅ When user is logged in, set OneSignal external ID
  useEffect(() => {
    const setExternalId = async () => {
      try {
        if (session?.user && OneSignal.login) {
          await OneSignal.login(session.user.email || session.user.id);
          console.log("✅ ExternalUserId set:", session.user.email || session.user.id);
        } else if (OneSignal.logout) {
          await OneSignal.logout();
          console.log("✅ ExternalUserId cleared");
        }
      } catch (err) {
        console.error("❌ Failed to set externalUserId:", err);
      }
    };
    setExternalId();
  }, [session]);
  

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
