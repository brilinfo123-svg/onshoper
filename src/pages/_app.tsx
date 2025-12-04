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

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");

  return (
    <SessionProvider session={pageProps.session}>
      {/* Wrap with OneSignal Login Handler */}
      <OneSignalLoginWrapper>
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
      </OneSignalLoginWrapper>
    </SessionProvider>
  );
}

// -----------------------------------------------------------------
// ✅ Component: Connect logged-in user to OneSignal (External User ID)
// -----------------------------------------------------------------
const OneSignalLoginWrapper = ({ children }) => {
  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined" && session?.user) {
      window.OneSignalDeferred = window.OneSignalDeferred || [];

      window.OneSignalDeferred.push(async function (OneSignal) {
        try {
          // Do NOT initialize here again — it is already initialized in <script>
          // Just set the external user ID
          await OneSignal.setExternalUserId(
            session.user.id || session.user.contact
          );
        } catch (err) {
          console.error("OneSignal externalId error:", err);
        }
      });
    }
  }, [session]);

  return children;
};


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
