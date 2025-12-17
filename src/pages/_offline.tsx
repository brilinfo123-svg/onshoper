import styles from "@/styles/offline.module.scss";
import Image from "next/image";

export default function Offline() {
    return (
      <div className={styles.offlineWrapper}>
        <Image
        src="/images/wifi.png"   // 👈 apna custom image rakho public/images folder me
        alt="No Internet"
        width={130}
        height={130}
        className={styles.offlineImage}
      />
        <h1>No Internet Connection</h1>
        <p>Please check your network and try again.</p>
        <button className={styles.retryButton} onClick={() => {if (navigator.onLine) {window.location.href = "/";
          } else {
            window.location.reload();
          }}}>Refresh Page
        </button>

      </div>
    );
  }
  