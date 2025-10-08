// components/SkeletonCard.tsx
import React from "react";
import styles from "./Index.module.scss";

const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImage}></div>
    <div className={styles.skeletonText}></div>
    <div className={styles.skeletonTextSmall}></div>
  </div>
);

export default SkeletonCard;
