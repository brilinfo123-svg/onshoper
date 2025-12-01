// components/MobileBottomNav/MobileBottomNav.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./index.module.scss";
import ChatSidebar from "../ChatSidebar/Index";
import Image from "next/image";

const MobileBottomNav = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearAllNotifications, getTotalNotifications } = useNotifications();

  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isOnChatPage = router.pathname.startsWith("/chat");
  const totalNotifications = isOnChatPage ? 0 : getTotalNotifications();

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
      icon: <Image src="/icons/homeIcone.png" alt="Home" width={32} height={32} />,
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        router.push("/");
      },
    },
    {
      name: "Chat",
      path: "/chat",
      icon: <Image src="/icons/chatIcone.png" alt="Chat" width={27} height={27} />,
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
        <Image
          src="/icons/plusIcone.png"
          alt="Post Ad"
          width={35}
          height={35}
          className={styles.postAdIcon}
        />
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
      icon: <Image src="/icons/catalog-alt.svg" alt="My Ads" width={25} height={23} />,
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
      icon: <Image src="/icons/userIcone.png" alt="Account" width={27} height={27} />,
      onClick: toggleAccount,
    },
  ];

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
                <div className={styles.navIcon}>
                  {item.icon}
                  {item.showBadge && totalNotifications > 0 && (
                    <span className={styles.notificationBadge}>
                      {totalNotifications > 99 ? "99+" : totalNotifications}
                    </span>
                  )}
                </div>
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
                <div className={styles.navIcon}>
                  {item.icon}
                  {item.showBadge && totalNotifications > 0 && (
                    <span className={styles.notificationBadge}>
                      {totalNotifications > 99 ? "99+" : totalNotifications}
                    </span>
                  )}
                </div>
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
                <Link href="/subscribePlan">
                  <span className={"icon-star"}></span>
                  My Purchase
                </Link>
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
