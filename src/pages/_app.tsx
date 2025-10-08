// /pages/_app.tsx
import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import DefaultHeader from "@/components/DefaultHeader/Index";
import { NotificationProvider } from '../contexts/NotificationContext';
import { CityFilterProvider } from "@/contexts/CityFilterContext";
import { FavoriteProvider } from '../contexts/FavoriteContext';
import { ChatProvider } from '@/contexts/ChatContext'; // Import ChatProvider
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

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SessionProvider session={pageProps.session}>
      <NotificationProvider>
        <FavoriteProvider>
          <ChatProvider>
            <CityFilterProvider> {/* 👈 Wrap here */}
              <ToastContainer position="top-right" autoClose={3000} />
              <AutoUnfeaturePoller />
              <HeaderComponent />
              <main>
                <Component {...pageProps} />
              </main>
              <Footer />
              <MobileBottomNav />
            </CityFilterProvider>
          </ChatProvider>
        </FavoriteProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}

// Show different headers based on session
const HeaderComponent = () => {
  const { data: session, status } = useSession();
  // if (status === "loading") return <p>Loading...</p>;
  return session ? <ProtectedHeader /> : <DefaultHeader />;
};

// 👇 Auto poll /api/unfeature-expired
const AutoUnfeaturePoller = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("../api/unfeature-expired");
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
};