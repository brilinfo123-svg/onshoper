import React from 'react';
import styles from './Index.module.scss';

interface ProfilePicSkeletonProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  shape?: 'circle' | 'square' | 'rounded';
  showCircle?: boolean;
  withText?: boolean;
  className?: string;
}

const ProfilePicSkeleton = ({ 
  size = 'medium', 
  shape = 'circle', 
  showCircle = true,
  withText = false,
  className = '' 
}: ProfilePicSkeletonProps) => {
  return (
    <div className={`${styles.profilePicSkeleton} ${styles[size]} ${styles[shape]} ${className}`}>
      {showCircle && <div className={styles.skeletonAvatar}></div>}
      {withText && (
        <div className={styles.skeletonTextContainer}>
          <div className={styles.skeletonName}></div> 
          {/* <div className={styles.skeletonUsername}></div> */}
        </div>
      )}
    </div>
  );
};

export default ProfilePicSkeleton;