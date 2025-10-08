import React from 'react'
import styles from './index.module.scss';


interface OffersBadgeProps {
  value: string; // The text or value to show inside the badge
  color?: string; // Background color (optional)
  size?: number; // Size of the badge (optional)
  class?: string;
}

const OffersBadge: React.FC<OffersBadgeProps> = ({ value}) => {
  return (
    <div className={`${styles.badge} ${styles.class}`}>
      <span className={styles.percent}><small></small> </span>
    </div>
  );
};

export default OffersBadge;
