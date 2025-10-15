import styles from "./Index.module.scss";

export default function SkeletonChatItem() {
  return (
    <>
      {[...Array(4)].map((_, index) => (
        <div key={index} className={styles.skeletonItem}>
          <div className={styles.avatar}></div>
          <div className={styles.textBlock}>
            <div className={styles.lineShort}></div>
            <div className={styles.lineLong}></div>
          </div>
        </div>
      ))}
    </>
  );
}
