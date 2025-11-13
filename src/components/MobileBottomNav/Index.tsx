// components/MobileBottomNav/MobileBottomNav.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./index.module.scss";
import ChatSidebar from "../ChatSidebar/Index";

const MobileBottomNav = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { clearAllNotifications, getTotalNotifications } = useNotifications();

  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);


  // Check if we're currently on a chat page
  const isOnChatPage = router.pathname.startsWith('/chat');

  // Don't show notifications if we're on chat page
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
    if (router.pathname !== '/chat') {
      setNotificationsOpen((prev) => !prev);
      if (isAccountOpen) setAccountOpen(false);
    } else {
      router.push('/chat');
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

  // Navigation items
  const navItems = [
    {
      name: 'Chat',
      path: '/chat',

      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        if (session?.user) {
          setIsChatOpen(true);
        } else {
          router.push("/login");
        }
      },
      showBadge: true
    },
    {
      name: 'Sale/Rent',
      path: '/ProductForm',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        if (session?.user) {
          router.push('/ProductForm');
        } else {
          router.push('/login');
        }
      }
    },
    {
      name: 'Account',
      path: session ? '/profile' : '/auth/signin',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
      onClick: toggleAccount
    }
  ];

  return (
    <>
      <div className={styles.mobileBottomNav}>
        {navItems.map((item) => (
          <div key={item.name} className={styles.navItemContainer}>
            {item.name === 'Account' || item.name === 'Chat' ? (
              <button
                className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
                onClick={item.onClick}
              >
                <div className={styles.navIcon}>
                  {item.icon}
                  {item.showBadge && totalNotifications > 0 && (
                    <span className={styles.notificationBadge}>
                      {totalNotifications > 99 ? '99+' : totalNotifications}
                    </span>
                  )}
                </div>
                <span className={styles.navLabel}>{item.name}</span>
              </button>
            ) : (
              <Link
                href={item.path}
                className={`${styles.navItem} ${router.pathname === item.path ? styles.active : ''}`}
                onClick={item.onClick}
              >
                <div className={styles.navIcon}>
                  {item.icon}
                  {item.showBadge && totalNotifications > 0 && (
                    <span className={styles.notificationBadge}>
                      {totalNotifications > 99 ? '99+' : totalNotifications}
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
                <Link href="/profile" onClick={() => setAccountOpen(false)}>
                  <span className={"icon-user-circle"} ></span>
                  My Account
                </Link>
                {/* <Link href="/favorites" onClick={() => setAccountOpen(false)}>
                  <span className={styles.dropdownIcon}>❤️</span>
                  My Favorites
                </Link> */}
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
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </>
  );
};

export default MobileBottomNav;