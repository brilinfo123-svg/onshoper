import styles from "./index.module.scss";

export default function LoginSkeleton() {
  return (
    <div className={styles.container}>
      <div className={styles.heading}></div>

      <div className={styles.button}></div>

      <div className={styles.line}></div>

      <div className={styles.button}></div>
    </div>
  );
}