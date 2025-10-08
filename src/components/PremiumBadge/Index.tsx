import React from 'react';
import styles from './Index.module.scss';

interface PremiumBadgeProps {
  Premium: boolean;
}

const PremiumBadge: React.FC<PremiumBadgeProps> = ({ Premium }) => {
  return Premium ? (
    <div className={styles.premiumAdd}>
      <span>Premium</span>
    </div>
  ) : null;
};

export default PremiumBadge;
