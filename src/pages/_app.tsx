// /pages/_app.tsx
import { useEffect, useState } from "react";
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

// ✅ Import nprogress for route loading bar
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "@/styles/_progress.css";

// ✅ Import ProductProvider for caching products
import { ProductProvider } from "@/contexts/ProductContext";
import { CategoryProvider } from "@/contexts/CategoryContext";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAdminPage = router.pathname.startsWith("/admin");
  const isProductDetailPage = router.pathname.startsWith("/product/");
  const isAuthPage = router.pathname.startsWith("/login");
  const isOfflinePage = router.pathname === "/_offline";
  const ProductForms = router.pathname === "/ProductForm";
  const isInstall = router.pathname === "/install";
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
  
    handleResize();
    window.addEventListener("resize", handleResize);
  
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Setup FCM + Service Worker
  useEffect(() => {
    const initFirebaseMessaging = async () => {
      try {
        const token = await generateToken();
        if (token) {
          console.log("✅ FCM Token:", token);
          // 👉 send token to backend /api/saveToken
        }
        listenForMessages();
      } catch (err) {
        console.error("❌ FCM init failed:", err);
      }
    };

    initFirebaseMessaging();

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

  // ✅ Setup NProgress for route changes
  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleStop);
    router.events.on("routeChangeError", handleStop);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleStop);
      router.events.off("routeChangeError", handleStop);
    };
  }, [router]);

  return (
    <SessionProvider session={pageProps.session}>
      <ProductProvider>
        <CategoryProvider>
          <NotificationProvider>
            <FavoriteProvider>
              <ChatProvider>
                <CityFilterProvider>
                  <FilterProvider>
                    <ToastContainer position="top-right" autoClose={3000} />
                    <AutoUnfeaturePoller />

                    {!isAdminPage && !isAuthPage && !isOfflinePage && !isInstall && !(router.pathname === "/ProductForm" && isMobile) && (<HeaderComponent Component={Component} />)}

                    <main>
                      <Component {...pageProps} />
                    </main>

                    {!isAdminPage && !isOfflinePage && !isInstall && !ProductForms && <Footer />}
                    {!isAdminPage && !isProductDetailPage && !isOfflinePage && !isInstall && !ProductForms && <MobileBottomNav />}
                  </FilterProvider>
                </CityFilterProvider>
              </ChatProvider>
            </FavoriteProvider>
          </NotificationProvider>
        </CategoryProvider>
      </ProductProvider>
    </SessionProvider>
  );
}

// -----------------------------------------------------------------
// Header Component
// -----------------------------------------------------------------
const HeaderComponent = ({ Component }: any) => {
  const { data: session } = useSession();

  // ✅ page-level override
  if (Component.hideHeader) return null;

  return session ? <ProtectedHeader /> : <DefaultHeader />;
};

// -----------------------------------------------------------------
// Auto poll /api/unfeature-expired
// -----------------------------------------------------------------
const AutoUnfeaturePoller = () => {
  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/unfeature-expired");
    }, 86400000); // once per day
    return () => clearInterval(interval);
  }, []);
  return null;
};
