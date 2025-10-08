"use client";
import { useEffect, useState } from "react";
import styles from "./Index.module.scss";

const IntroAnimation = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");
    if (!hasVisited) {
      setShowAnimation(true); // ✅ show animation on first visit
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  useEffect(() => {
    if (fadeOut) {
      const timeout = setTimeout(() => {
        setShowAnimation(false); // ✅ hide component after fade
      }, 2000); // match fadeOut transition duration
      return () => clearTimeout(timeout);
    }
  }, [fadeOut]);

  const handleLastLetterAnimationEnd = () => {
    setTimeout(() => {
      setFadeOut(true); // ✅ trigger fade out
    }, 500);
  };

  if (!showAnimation) return null;

  return (
    <div className={`${styles.overlay} ${fadeOut ? styles.fadeOut : ""}`}>
      <div className={styles.logo}>
        <span className={styles.letter}>O</span>
        <span className={styles.letter}>n</span>
        <span className={styles.letter}>S</span>
        <span className={styles.letter}>h</span>
        <span className={styles.letter}>o</span>
        <span className={styles.letter}>p</span>
        <span className={styles.letter}>e</span>
        <span className={styles.letter} onAnimationEnd={handleLastLetterAnimationEnd}>
          r
        </span>
      </div>
    </div>
  );
};

export default IntroAnimation;
