import React from 'react';
import styles from '@/styles/profile/profile.module.scss';

const ProfileCard = () => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.avatar}></div>

      <div className={styles.info}>
        <h3>Akash Verma</h3>
        <p>Founder, Onshoper.com</p>

        <div className={styles.statsGrid}>
          <div>
            <h4>52</h4>
            <p>Total Ads</p>
          </div>
          <div>
            <h4>14</h4>
            <p>Active Rentals</p>
          </div>
          <div>
            <h4>4.9</h4>
            <p>Rating</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
