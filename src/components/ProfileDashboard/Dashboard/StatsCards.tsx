import React from "react";
import { FiTag, FiHome, FiClock, FiDollarSign } from "react-icons/fi";
import styles from "@/styles/profile/cards.module.scss";

const StatsCards = () => {
  const stats = [
    { label: "Total Ads", value: 52, icon: <FiTag /> },
    { label: "Active Rentals", value: 14, icon: <FiHome /> },
    { label: "Pending Requests", value: 8, icon: <FiClock /> },
    { label: "Total Earnings", value: "₹12,450", icon: <FiDollarSign /> },
  ];

  return (
    <div className={styles.statsGrid}>
      {stats.map((item) => (
        <div key={item.label} className={styles.statCard}>
          <div className={styles.iconWrapper}>{item.icon}</div>
          <div>
            <p className={styles.statLabel}>{item.label}</p>
            <h3 className={styles.statValue}>{item.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
