// pages/404.tsx
import Link from "next/link";
import styles from "@/styles/404.module.scss"; // optional SCSS styling

const Custom404 = () => {
  return (
    <div className={styles.wrapper}>
      <h1>404 – Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link href="/" className={styles.homeLink}>
        Go back to Home
      </Link>
    </div>
  );
};

export default Custom404;
