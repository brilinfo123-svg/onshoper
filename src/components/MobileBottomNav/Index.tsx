"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession, signOut } from "next-auth/react";
import { useChat } from "@/contexts/ChatContext";
import styles from "./index.module.scss";
import LoginModal from "../LoginModal/Index";

const MobileBottomNav = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { totalUnread } = useChat();

  const [isAccountOpen, setAccountOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const accountRef = useRef<HTMLDivElement | null>(null);

  const isOnChatPage = router.pathname.startsWith("/chat");

  const totalNotifications = isOnChatPage ? 0 : totalUnread;

  useEffect(() => {
    console.log("📱 Mobile totalUnread:", totalUnread);
    console.log("📱 totalNotifications:", totalNotifications);
    console.log("📱 isOnChatPage:", isOnChatPage);
  }, [totalUnread, totalNotifications, isOnChatPage]);

  // --------------------------------
  // Logout
  // --------------------------------

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
    setAccountOpen(false);
  };

  // --------------------------------
  // Account
  // --------------------------------

  const toggleAccount = () => {
    setAccountOpen((prev) => !prev);

    if (isNotificationsOpen) {
      setNotificationsOpen(false);
    }
  };

  // --------------------------------
  // Close dropdown
  // --------------------------------

  const handleClickOutside = (event: MouseEvent) => {
    if (
      accountRef.current &&
      !accountRef.current.contains(event.target as Node)
    ) {
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

  // --------------------------------
  // Open login modal
  // --------------------------------

  const openLoginModal = () => {
    setAccountOpen(false);
    setNotificationsOpen(false);
    setIsLoginOpen(true);
  };

  // --------------------------------
  // Protected navigation
  // --------------------------------

  const handleProtectedNavigation = (path: string) => {
    setAccountOpen(false);
    setNotificationsOpen(false);

    if (session?.user) {
      router.push(path);
    } else {
      openLoginModal();
    }
  };

  // --------------------------------
  // Navigation items
  // --------------------------------

  const navItems = [
    {
      name: "Home",
      path: "/",
      icon: (
        <img
          src="/icons/homeIcone.png"
          alt="Home"
          width={32}
          height={32}
        />
      ),
      onClick: () => {
        setAccountOpen(false);
        setNotificationsOpen(false);
        router.push("/");
      },
    },

    {
      name: "Chat",
      path: "/chat",
      icon: (
        <img
          src="/icons/chat-round.svg"
          alt="Chat"
          width={30}
          height={30}
        />
      ),
      onClick: () => {
        handleProtectedNavigation("/chat");
      },
      showBadge: true,
    },

    {
      name: "Post Ads",
      path: "/ProductForm",
      icon: (
        <img
          src="/icons/AddProducts.svg"
          width={35}
          height={35}
          alt="Post Ad"
          className={styles.postAdIcon}
        />
      ),
      onClick: () => {
        handleProtectedNavigation("/ProductForm");
      },
    },

    {
      name: "My Ads",
      path: "/profile",
      icon: (
        <img
          src="/icons/catalog-alt.svg"
          alt="My Ads"
          width={25}
          height={23}
        />
      ),
      onClick: () => {
        handleProtectedNavigation("/profile");
      },
    },

    {
      name: "Account",
      path: session ? "/profile" : "/auth/signin",
      icon: (
        <img
          src="/icons/userIcone.png"
          alt="Account"
          width={27}
          height={27}
        />
      ),
      onClick: toggleAccount,
    },
  ];

  // --------------------------------
  // Render icon + badge
  // --------------------------------

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
      {/* Mobile Bottom Navigation */}

      <div className={styles.mobileBottomNav}>
        {navItems.map((item) => (
          <div
            key={item.name}
            className={`${styles.navItemContainer} ${
              item.name === "Post Ads"
                ? styles.postAdsContainer
                : ""
            }`}
          >
            {/* Account */}
            {item.name === "Account" ? (
              <button
                type="button"
                aria-label="Account"
                className={`${styles.navItem} ${
                  router.pathname === item.path
                    ? styles.active
                    : ""
                }`}
                onClick={item.onClick}
              >
                {renderNavIcon(item)}

                <span className={styles.navLabel}>
                  {item.name}
                </span>
              </button>
            ) : (
              /* All other items */
              <button
                type="button"
                className={`${styles.navItem} ${
                  router.pathname === item.path
                    ? styles.active
                    : ""
                }`}
                onClick={item.onClick}
              >
                {renderNavIcon(item)}

                <span className={styles.navLabel}>
                  {item.name}
                </span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Account Dropdown */}

      {isAccountOpen && (
        <div
          ref={accountRef}
          className={styles.dropdown}
        >
          <div className={styles.dropdownContent}>
            {session ? (
              <>
                <Link
                  href="/profile"
                  onClick={() => setAccountOpen(false)}
                >
                  <span className="icon-user-circle"></span>
                  My Account
                </Link>

                <button
                  type="button"
                  aria-label="Logout"
                  onClick={handleLogout}
                >
                  <span className="icon-off"></span>
                  Logout
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={openLoginModal}
              >
                <span className={styles.dropdownIcon}>
                  🔑
                </span>

                Sign In to Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Login Modal */}

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
};

export default MobileBottomNav;