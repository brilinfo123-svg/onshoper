import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";   // ⭐ ADD THIS
import {
  FiGrid,
  FiTag,
  FiShoppingBag,
  FiHome,
  FiClipboard,
  FiCheckCircle,
  FiXCircle,
  FiTruck,
  FiArchive,
  FiFileText,
  FiShield,
  FiDollarSign,
  FiStar,
  FiMessageSquare,
  FiBell,
  FiSettings,
  FiTrash2
} from "react-icons/fi";

import styles from "@/styles/profile/sidebar.module.scss";

const Sidebar = () => {
  const router = useRouter();   // ⭐ CURRENT ROUTE

  const menuItems = [
    { name: "Dashboard", path: "/profiles", icon: <FiGrid /> },
    { name: "My Ads", path: "/profiles/my-ads", icon: <FiTag /> },
    // { name: "Sale Products", path: "/profiles/sale", icon: <FiShoppingBag /> },
    // { name: "Rental Products", path: "/profiles/rental", icon: <FiHome /> },
    { name: "Rental Requests", path: "/profiles/rental-requests", icon: <FiClipboard /> },
    { name: "Approved Rentals", path: "/profiles/approved", icon: <FiCheckCircle /> },
    { name: "Rejected Requests", path: "/profiles/rejected", icon: <FiXCircle /> },
    { name: "Current Rentals", path: "/profiles/current-rentals", icon: <FiTruck /> },
    { name: "Completed Rentals", path: "/profiles/completed", icon: <FiArchive /> },
    { name: "Documents", path: "/profiles/documents", icon: <FiFileText /> },
    { name: "Verification Center", path: "/profiles/verification", icon: <FiShield /> },
    { name: "Security Deposits", path: "/profiles/deposits", icon: <FiDollarSign /> },
    // { name: "Earnings", path: "/profiles/earnings", icon: <FiDollarSign /> },
    { name: "Reviews", path: "/profiles/reviews", icon: <FiStar /> },
    { name: "Messages", path: "/profiles/messages", icon: <FiMessageSquare /> },
    { name: "Notifications", path: "/profiles/notifications", icon: <FiBell /> },
    { name: "Settings", path: "/profiles/settings", icon: <FiSettings /> },
    { name: "Delete Account", path: "/profiles/delete-account", icon: <FiTrash2 /> },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>PRACTICE</div>
      {/* ONSHOPER */}

      <nav className={styles.menu}>
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;   // ⭐ CHECK ACTIVE

          return (
            <Link
              key={item.name}
              href={item.path}
              className={`${styles.menuItem} ${isActive ? styles.active : ""}`}   // ⭐ APPLY CLASS
            >
              <span className={styles.icon}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
