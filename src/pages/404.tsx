// pages/404.tsx
import Link from "next/link";
import styles from "@/styles/404.module.scss"; // optional SCSS styling
import SEO from "next/head";

const Custom404 = () => {
  return (
    <>
    <SEO>
    <title>404 – Page Not Found | OnShoper</title>
    <meta name="description" content="Oops! The page you’re looking for doesn’t exist. Go back to OnShoper homepage to continue browsing."/>
    <meta name="robots" content="noindex, follow" />
  </SEO>
    <div className={styles.wrapper}>
      <h1>404 – Page Not Found</h1>
      <p>Sorry, the page you're looking for doesn't exist.</p>
      <Link href="/" className={styles.homeLink}> Go back to Home</Link>
    </div>
    </>
  );
};

export default Custom404;
