import React from 'react';
import styles from '@/styles/profile/profile.module.scss';

const DocumentStatus = () => {
  const docs = [
    { name: 'Aadhar Card', status: 'Uploaded' },
    { name: 'PAN Card', status: 'Missing' },
    { name: 'Driving License', status: 'Uploaded' },
  ];

  return (
    <div className={styles.documentCard}>
      <h3 className={styles.title}>Document Status</h3>

      <ul className={styles.docList}>
        {docs.map((d) => (
          <li key={d.name} className={styles.docItem}>
            <span>{d.name}</span>
            <span
              className={`${styles.badge} ${
                d.status === 'Uploaded' ? styles.verified : styles.pending
              }`}
            >
              {d.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentStatus;
