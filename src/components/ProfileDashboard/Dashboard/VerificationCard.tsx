import React from 'react';
import styles from '@/styles/profile/profile.module.scss';

const VerificationCard = () => {
  const items = [
    { label: 'Mobile OTP', status: 'Verified' },
    { label: 'Email Verification', status: 'Verified' },
    { label: 'Government ID', status: 'Pending' },
    { label: 'Rental Summary', status: 'Pending' },
  ];

  return (
    <div className={styles.verificationCard}>
      <h3 className={styles.title}>Verification Status</h3>

      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.label} className={styles.item}>
            <span>{item.label}</span>
            <span
              className={`${styles.badge} ${
                item.status === 'Verified' ? styles.verified : styles.pending
              }`}
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VerificationCard;
