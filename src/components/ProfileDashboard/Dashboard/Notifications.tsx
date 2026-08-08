import React from 'react';
import styles from '@/styles/profile/cards.module.scss';

const Notifications = () => {
  const list = [
    { msg: 'Your rental request was approved.', time: '2h ago' },
    { msg: 'New message from Priya.', time: '5h ago' },
    { msg: 'Document verification pending.', time: '1d ago' },
  ];

  return (
    <div className={styles.notificationCard}>
      <h3 className={styles.title}>Notifications</h3>

      {list.map((n, i) => (
        <div key={i} className={styles.notificationItem}>
          <p>{n.msg}</p>
          <span>{n.time}</span>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
