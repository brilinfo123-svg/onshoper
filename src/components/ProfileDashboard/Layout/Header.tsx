import React, { useState } from "react";
import Image from "next/image";
import { FiSearch, FiBell, FiMessageSquare, FiMenu, FiUser, FiSettings, FiLogOut } from "react-icons/fi";
import styles from "@/styles/profile/header.module.scss";

export default function Header({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

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
          <Image
            src="/images/profile.png"
            alt="User Avatar"
            width={40}
            height={40}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <span className={styles.name}>Sonu Serma</span>
            <span className={styles.verified}>
              <span className={styles.ProfileIcon}>✓</span> Verified
            </span>
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
