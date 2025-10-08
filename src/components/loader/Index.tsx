import React from 'react'
import styles from '@/components/loader/Index.module.scss'

interface LoaderProps {
  message?: string; // Optional message to display with the loader
}

const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className={styles.loaderWrapper}>
      <div className={styles.spinner}></div>
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default Loader;
