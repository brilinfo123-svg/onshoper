import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useProfile } from "@/contexts/ProfileContext";

import {
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiMenu,
  FiUser,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import styles from "@/styles/profile/header.module.scss";


export default function Header({
  onToggleSidebar,
  user, // ✅ receive user as prop from ProfileDashboard
}: {
  onToggleSidebar: () => void;
  user: any;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const { data: session } = useSession();
  const { profile: shopData, loading, fetchProfile } = useProfile();

  console.log("shopData", shopData);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // ✅ Fetch verification status only
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        if (!session?.user?.id) return;
        const res = await fetch(
          `/api/verification/getCurrentUser?userId=${session.user.id}`
        );
        const data = await res.json();
        setStatus(data.status);
      } catch (error) {
        console.error("Failed to fetch verification status:", error);
      }
    };
    fetchStatus();
  }, [session?.user?.id]);

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <FiMenu className={styles.menuIcon} onClick={onToggleSidebar} />
      </div>

      <div className={styles.search}>
        <FiSearch className={styles.searchIcon} />
        <input type="text" placeholder="Search anything..." />
      </div>

      <div className={styles.right}>
        <FiMessageSquare className={styles.icon} />
        <div className={styles.bellWrapper}>
          <FiBell className={styles.icon} />
          <span className={styles.badge}>5</span>
        </div>

        <div className={styles.user} onClick={toggleDropdown}>
          {/* ✅ Dynamic photo from user prop */}
          <Image
            src={shopData?.user?.photo || "/images/profile.png"}
            alt="User Avatar"
            width={40}
            height={40}
            className={styles.avatar}
          />

          <div className={styles.userInfo}>
            {/* ✅ Dynamic name from user prop */}
            <span className={styles.name}>{shopData?.user?.name || "Guest User"}</span>

            {/* ✅ Show Verified only if status is Approved */}
            {status === "Approved" && (
              <span className={styles.verified}>
                <span className={styles.ProfileIcon}>✓</span> Verified
              </span>
            )}
          </div>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className={styles.dropdown}>
              <button className={styles.dropdownItem}>
                <FiUser /> View Profile
              </button>
              <button className={styles.dropdownItem}>
                <FiSettings /> Settings
              </button>
              <button className={styles.dropdownItem}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
