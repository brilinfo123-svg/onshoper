// components/ProtectedHeader/index.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Style from "@/components/ProtectedHeader/index.module.scss";
import FilterLocation from "@/components/FilterLocation/Index";
import { useCityFilter } from "@/contexts/CityFilterContext";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import { useRouter } from "next/router";
import Banner from "../Banner/Index";
import { useFavorites } from "@/contexts/FavoriteContext";
import ProductPost from "@/components/ProductPost/Index";
import ChatSidebar from "@/components/ChatSidebar/Index";
import Layout from "../Layout/Index";
import useMediaQuery from "../../../hooks/useMediaQuery";




const Header: React.FC = () => {
  const { data: session, status } = useSession();
  const { notifications, clearAllNotifications, getTotalNotifications } = useNotifications();
  const isDesckTop = useMediaQuery("(min-width: 992px)");
  const router = useRouter();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isFavoritesSidebarOpen, setFavoritesSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const favoritesSidebarRef = useRef<HTMLDivElement | null>(null);
  const { favorites } = useFavorites();
  const [isChatOpen, setIsChatOpen] = useState(false);
  // const { setSelectedCity } = useCityFilter();
  // Check if we're currently on a chat page
  const isOnChatPage = router.pathname.startsWith('/chat');

  // Don't show notifications if we're on chat page
  const totalNotifications = isOnChatPage ? 0 : getTotalNotifications();

  useEffect(() => {
    // Check if device is mobile
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 991);
    };

    // Initial check
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener('resize', checkIsMobile);

    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Fetch wishlist products when favorites sidebar is opened
  useEffect(() => {
    const fetchWishlist = async () => {
      if (isFavoritesSidebarOpen && session?.user?.contact) {
        setLoadingFavorites(true);
        try {
          const res = await fetch("/api/favorites/fetchFavoritesByShopOwner", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: session.user.contact }),
          });

          const text = await res.text();
          const data = text ? JSON.parse(text) : {};

          if (res.ok) {
            setWishlistProducts(data.products || []);
          } else {
            console.error("Failed to fetch wishlist:", data.error || "Unknown error");
          }
        } catch (error) {
          console.error("Error fetching wishlist:", error);
        } finally {
          setLoadingFavorites(false);
        }
      }
    };

    fetchWishlist();
  }, [isFavoritesSidebarOpen, session]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    // Close favorites sidebar if open
    if (isFavoritesSidebarOpen) {
      setFavoritesSidebarOpen(false);
    }
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const toggleFavoritesSidebar = () => {
    setFavoritesSidebarOpen((prev) => !prev);
    // Close account sidebar if open
    if (isSidebarOpen) {
      setSidebarOpen(false);
    }
  };

  const closeFavoritesSidebar = () => {
    setFavoritesSidebarOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setDropdownOpen(false);
    }
    if (favoritesSidebarRef.current && !favoritesSidebarRef.current.contains(event.target as Node)) {
      setFavoritesSidebarOpen(false);
    }
  };

  const handleNotificationClick = () => {
    clearAllNotifications();
    closeSidebar();
  };

  const handleViewAllFavorites = () => {
    closeFavoritesSidebar();
    router.push('/favorites');
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    const handleRouteChange = () => {
      closeSidebar();
      closeFavoritesSidebar();
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const handleCityChange = (city: string, isManual: boolean = false) => {
    localStorage.setItem("selectedCity", city);
    // Optional: apply filtering logic here

    if (isManual) {
      router.push({
        pathname: "/filter",
        query: { city }
      });
    }
  };
  // Skeleton Loading Component
  const HeaderSkeleton = () => (
    <header className={Style.header}>
      <div className={Style.headerWrapper}>
        {/* Logo Skeleton */}
        <div className={Style.logoSkeleton}>
          <div className={Style.skeletonLogo}></div>
        </div>

        {/* Banner Skeleton (hidden on mobile) */}
        {!isMobile && (
          <div className={Style.bannerSkeleton}>
            <div className={Style.skeletonBanner}></div>
          </div>
        )}

        {/* Action Section Skeleton */}
        <ul className={Style.rightMenus}>
          <li>
            <div className={Style.skeletonButton}></div>
          </li>
          <li>
            <div className={Style.skeletonNotification}></div>
          </li>
          <li>
            <div className={Style.skeletonAccount}></div>
          </li>
        </ul>
      </div>
    </header>
  );

  if (isLoading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className={Style.header}>
      {!isDesckTop && 
        <div className={Style.MobileTopbar}>
        <Link href="/">
          {/* <h3 style={{ fontSize: "25px", fontWeight: "bold", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", margin: 0 }}>
            <span style={{ color: "#007bff", fontFamily: "cursive", }}>A</span>
            <span style={{ color: "#28a745" }}>S</span>
            <span style={{ color: "#ff5722" }}>R</span>
          </h3> */}
          {/* <img src="/icons/logo2.png" alt="" width="100px"/> */}
          <div className={Style.logo}>
              <h3>ON</h3>
              <div className={Style.logoDesc}>
                 <h4>Shoper</h4>
                 <span>Sale & Rent</span>
              </div>
            </div>
        </Link>
        <FilterLocation onCityChange={handleCityChange} />
        </div>
      }
      {/* <h4 className={Style.showinMobile}>
      
        <span className="icon-shop"></span> You can find the nearest store in your area
      </h4> */}

      <div className={Style.headerWrapper}>
        {/* Logo Section */}
        {!isMobile && 
        <div className={Style.logoSection}>
          <Link href="/">
            {/* <h2><span className="icon-shop"></span> Local  </h2> */}
            <div className={Style.logo}>
              <h3>ON</h3>
              <div className={Style.logoDesc}>
                 <h4>Shoper</h4>
                 <span>Sale & Rent</span>
              </div>
            </div>
          </Link>
        </div>
        }
        
        {/* Banner (hidden on mobile) */}
        <div className={Style.filterLocationWrapper}>
          {!isMobile && <FilterLocation onCityChange={handleCityChange} />}
        
        <Banner />
        </div>

        {/* Action Section */}
        <div className={Style.actionSection}>
          <div className={`${Style.sidebar} ${isSidebarOpen ? Style.sidebarOpen : ""}`}>
            <button className={Style.closeButton} onClick={closeSidebar}>&times;</button>
            <ul>
              <li><Link href="/profile" className="icon-user-circle" onClick={closeSidebar}>My Account</Link></li>
              <li><Link href="/favorites" className="icon-shop" onClick={closeSidebar}>My Favorites</Link></li>
              <li><a className="icon-off" href="javascript:void(0)" onClick={handleLogout}>Logout</a></li>
            </ul>
          </div>

          {/* Favorites Sidebar */}
          {/* Favorites Sidebar */}
          <div
            className={`${Style.favoritesSidebar} ${isFavoritesSidebarOpen ? Style.favoritesSidebarOpen : ""}`}
            ref={favoritesSidebarRef}
          >
            <div className={Style.favoritesSidebarHeader}>
              <h2>
                <span className="icon-heart"></span>
                My Favorites ({favorites.length})
              </h2>
              <button className={Style.closeButton} onClick={closeFavoritesSidebar}>&times;</button>
            </div>

            <div className={Style.favoritesSidebarContent}>
              {loadingFavorites ? (
                <div className={Style.loadingFavorites}>
                  <span>Loading your favorites...</span>
                </div>
              ) : favorites.length > 0 && wishlistProducts.length > 0 ? (
                <div className={Style.favoritesGrid}>
                  {wishlistProducts.map((product) => (
                    <div key={product._id} className={Style.favoriteProductCard}>
                      <ProductPost
                        _id={product._id}
                        title={product.title}
                        description={""}
                        category={product.category}
                        subCategory={product.subcategory}
                        price={Number(product.price)}
                        priceWeek={product.priceWeek !== undefined ? Number(product.priceWeek) : undefined}
                        priceMonth={product.priceMonth !== undefined ? Number(product.priceMonth) : undefined}
                        SalePrice={product.SalePrice}
                        coverImage={product.coverImage || product.images?.[0] || "/images/img2.jpg"}
                        images={product.images || []}
                        location={product.location || "Not specified"}
                        createdAt={product.createdAt}
                        isFeatured={product.featured || false}
                        shopOwnerID={product.shopOwnerID}
                        showOnlyWishlistItems={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className={Style.noFavorites}>
                  <span className="icon-heart-empty"></span>
                  <p>No favorites yet</p>
                  <p>Start adding products to your wishlist!</p>
                  <button
                    className={Style.browseButton}
                    onClick={() => {
                      closeFavoritesSidebar();
                      router.push('/');
                    }}
                  >
                    Browse Products
                  </button>
                </div>
              )}
            </div>

            {favorites.length > 0 && (
              <div className={Style.favoritesSidebarFooter}>
                <button
                  className={Style.viewAllButton}
                  onClick={handleViewAllFavorites}
                >
                  View All Favorites
                </button>
              </div>
            )}
          </div>

          {/* Backdrop overlay */}
          {(isSidebarOpen || isFavoritesSidebarOpen) && (
            <div
              className={Style.backdrop}
              onClick={() => {
                closeSidebar();
                closeFavoritesSidebar();
              }}
            />
          )}
        </div>

        <ul className={Style.rightMenus}>
        {!isMobile && <li><Link href="/ProductForm" className={`${Style.sellAdd} ${"icon-shop"}`} onClick={closeSidebar}>Sale/Rent</Link></li>}
          <li className={Style.notificationItem}>
          <div className={`${Style.Notification} icon-bell`} onClick={() => setIsChatOpen(true)} role="button" tabIndex={0}>
            {totalNotifications > 0 && (
              <span className={Style.notificationBadge}>
                {totalNotifications > 99 ? '99+' : totalNotifications}
              </span>
            )}
          </div>
          </li>

          <li className={Style.favoriteItem}>
            <div className={`${Style.favoriteTrigger} ${favorites.length > 0 ? Style.hasFavorites : ''}`} onClick={toggleFavoritesSidebar}>
              <span className={favorites.length > 0 ? "icon-heart" : "icon-heart-empty"}></span>
              {favorites.length > 0 && (
                <span className={Style.favoriteBadge}>{favorites.length > 99 ? '99+' : favorites.length}</span>
              )}
            </div>
          </li>
          {!isMobile && 
          <li>
            <button className={`${Style.toggleButton}`} onClick={toggleSidebar}>
              <span className="icon-user-circle"></span>
              <span>Account</span>
            </button>
          </li>
          }
        </ul>
      </div>
      <ChatSidebar 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
      />

      <Layout hideOnOverlayClick={true} children={undefined} >
      </Layout>
      
      {/* Overlay for when sidebar is open */}
      <div className={`${Style.overlay} ${isChatOpen ? Style.open : ''}`}
        onClick={() => setIsChatOpen(false)}
      />
      {/* <button 
        className={Style.chatButton}
        onClick={() => setIsChatOpen(true)}
      >
        💬 Chats
      </button> */}
    </header>
  );
};

export default Header;