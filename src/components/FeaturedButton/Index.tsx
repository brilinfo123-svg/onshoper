// components/FeatureProductButton.jsx
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import styles from "./Index.module.scss";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FeatureProductButton = ({ shopOwnerID }) => {
  const { data: session } = useSession();
  const [isFeatured, setIsFeatured] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleFeature = async () => {
    if (!session) return alert("Login required!");

    try {
      const res = await fetch("/api/featureProduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopOwnerID }),
      });

      if (res.ok) {
        const until = Date.now() + 10 * 1000;
        localStorage.setItem("featuredUntil", until.toString());
        setIsFeatured(true);
        setRemainingTime(10);
        toast.success("Product featured successfully!");
      }
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong.");
    }
  };

  // Timer logic
  useEffect(() => {
    const interval = setInterval(() => {
      const until = localStorage.getItem("featuredUntil");
      if (until) {
        const timeLeft = parseInt(until) - Date.now();
        if (timeLeft > 0) {
          setRemainingTime(Math.floor(timeLeft / 1000));
          setIsFeatured(true);
        } else {
          setIsFeatured(false);
          setRemainingTime(0);
          localStorage.removeItem("featuredUntil");
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.featureWrapper}>
      <button
        className={`${styles.featureButton} ${isFeatured ? styles.active : ""}`}
        onClick={handleFeature}
        disabled={isFeatured}
      >
        {isFeatured ? (
          <>
            <span className={styles.timerDot}></span>
            Featured ({remainingTime}s)
          </>
        ) : (
          "✨ Make Featured"
        )}
      </button>
    </div>
  );
};

export default FeatureProductButton;
