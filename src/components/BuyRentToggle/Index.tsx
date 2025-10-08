"use client";
import React, { useState } from "react";
import styles from "./Index.module.scss";

const BuyRentToggle: React.FC<{ onToggle: (mode: string) => void }> = ({ onToggle }) => {
  const [mode, setMode] = useState("buy");

  const handleToggle = (selected: string) => {
    setMode(selected);
    onToggle(selected); // Pass value to parent (Header)
  };

  return (
    <div className={styles.toggleWrapper}>
      <button
        className={`${styles.toggleBtn} ${mode === "buy" ? styles.active : ""}`}
        onClick={() => handleToggle("buy")}
      >
        Buy
      </button>
      <button
        className={`${styles.toggleBtn} ${mode === "rent" ? styles.active : ""}`}
        onClick={() => handleToggle("rent")}
      >
        Rent
      </button>
    </div>
  );
};

export default BuyRentToggle;
