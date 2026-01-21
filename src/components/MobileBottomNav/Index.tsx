"use client";
import React, { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./index.module.scss";
import ChatSidebar from "../ChatSidebar/Index";
import Image from "next/image";
import debounce from "lodash.debounce";

const MobileBottomNav = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearAllNotifications, getTotalNotifications } = useNotifications();

  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // ✅ new state for DB notifications
  const [dbNotifications, setDbNotifications] = useState(0);

  const isOnChatPage = router.pathname.startsWith("/chat");

  // ✅ fetch notifications from DB when session loads + auto refresh
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications/${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setDbNotifications(data.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    // ✅ Debounced version of fetch
    const debouncedFetch = debounce(fetchNotifications, 1000);

    // Initial call
    debouncedFetch();

    // ✅ auto refresh every 30 seconds
    const interval = setInterval(debouncedFetch, 30000);

    return () => {
      clearInterval(interval);
      debouncedFetch.cancel(); // cleanup debounce
    };
  }, [session?.user?.id]);

  // ✅ merge socket + DB counts
  const totalNotifications = isOnChatPage
    ? 0
    : Math.max(dbNotifications, getTotalNotifications());

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
    setAccountOpen(false);
  };

  const toggleAccount = () => {
    setAccountOpen((prev) => !prev);
    if (isNotificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    if (router.pathname !== "/chat") {
      setNotificationsOpen((prev) => !prev);
      if (isAccountOpen) setAccountOpen(false);
    } else {
      router.push("/chat");
    }
  };

  const handleNotificationClick = () => {
    clearAllNotifications();
    setNotificationsOpen(false);
    setDbNotifications(0); // ✅ clear DB badge too
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
      setAccountOpen(false);
      setNotificationsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ navItems
  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: <img src="/icons/homeIcone.png" alt="Home" width={32} height={32} />,
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        router.push("/");
      },
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <img src="/icons/chat-round.svg" alt="Chat" width={30} height={30} />,
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        if (session?.user) {
          setIsChatOpen(true);
        } else {
          router.push("/login");
        }
      },
      showBadge: true,
    },
    {
      name: "Post Ads",
      path: "/ProductForm",
      icon: (
        <img src="/icons/AddProducts.svg" width={35} height={35} alt="Post Ad" className={styles.postAdIcon}/>
      ),
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        if (session?.user) {
          router.push("/ProductForm");
        } else {
          router.push("/login");
        }
      },
    },
    {
      name: "My Ads",
      path: "/profile",
      icon: <img src="/icons/catalog-alt.svg" alt="My Ads" width={25} height={23} />,
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        if (session?.user) {
          router.push("/profile");
        } else {
          router.push("/login");
        }
      },
    },
    {
      name: "Account",
      path: session ? "/profile" : "/auth/signin",
      icon: <img src="/icons/userIcone.png" alt="Account" width={27} height={27} />,
      onClick: toggleAccount,
    },
  ];

  // ✅ Helper to render icon + badge
  const renderNavIcon = (item: any) => (
    <div className={styles.navIcon}>
      {item.icon}
      {item.showBadge && totalNotifications > 0 && (
        <span className={styles.notificationBadge}>
          {totalNotifications > 99 ? "99+" : totalNotifications}
        </span>
      )}
    </div>
  );

  return (
    <>
      <div className={styles.mobileBottomNav}>
        {navItems.map((item) => (
          <div
            key={item.name}
            className={`${styles.navItemContainer} ${
              item.name === "Post Ads" ? styles.postAdsContainer : ""
            }`}
          >
            {item.name === "Account" || item.name === "Chat" ? (
              <button
                className={`${styles.navItem} ${
                  router.pathname === item.path ? styles.active : ""
                }`}
                onClick={item.onClick}
              >
                {renderNavIcon(item)}
                <span className={styles.navLabel}>{item.name}</span>
              </button>
            ) : (
              <Link
                href={item.path}
                className={`${styles.navItem} ${
                  router.pathname === item.path ? styles.active : ""
                }`}
                onClick={item.onClick}
              >
                {renderNavIcon(item)}
                <span className={styles.navLabel}>{item.name}</span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Account Dropdown */}
      {isAccountOpen && (
        <div ref={accountRef} className={styles.dropdown}>
          <div className={styles.dropdownContent}>
            {session ? (
              <>
                <Link href="/profile" onClick={() => setAccountOpen(false)}>
                  <span className={"icon-user-circle"}></span>
                  My Account
                </Link>

                <button onClick={handleLogout}>
                  <span className={"icon-off"}></span>
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setAccountOpen(false)}>
                <span className={styles.dropdownIcon}>🔑</span>
                Sign In to Continue
              </Link>
            )}
          </div>
        </div>
      )}

      <ChatSidebar isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
};

export default MobileBottomNav;
