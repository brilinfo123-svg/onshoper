// pages/offline.tsx
import styles from "@/styles/offline.module.scss";
import Link from "next/link";

const OfflinePage = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <h1>No Internet Connection</h1>
        <p>Please check your network and try again.</p>
        <Link href="/" className={styles.retryButton}>
          Retry
        </Link>
      </div>
      <div className={styles.bgAnimation}></div>
    </div>
  );
};

export default OfflinePage;
