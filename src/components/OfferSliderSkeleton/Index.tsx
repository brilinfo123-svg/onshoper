import React from 'react';
import styles from './Index.module.scss';

interface Props {
  count?: number;
}

const OfferSliderSkeleton = ({ count = 4 }: Props) => {
  return (
    <div className={styles.skeletonContainer}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className="wrapper">
            <div className={styles.skeletonImage}></div>
          </div>
          <div className="wrapper">
            <div className={styles.skeletonBadge}></div>
            <div className={styles.skeletonTitle}></div>
            <div className={styles.skeletonText}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OfferSliderSkeleton;
