import { useState, useEffect } from "react";
import styles from "./Index.module.scss";

interface AverageRatingProps {
  shopKeeperID: string;
}

const AverageRating: React.FC<AverageRatingProps> = ({ shopKeeperID }) => {
  const totalStars = 5;
  const [averageRating, setAverageRating] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!shopKeeperID) return;
      try {
        const response = await fetch(`/api/review?ShopKeeperID=${shopKeeperID}`);
        const data = await response.json();
        // console.log("Fetched averageRating:", data.averageRating);
        const avg = Number(data.averageRating) || 0;
        setAverageRating(avg);
      } catch (error) {
        console.error("Error fetching average rating:", error);
      }
    };

    fetchData();
  }, [shopKeeperID]);

  // Render stars based on the averageRating, including half stars if needed.
  const renderStar = (index: number) => {
    const starValue = averageRating - index;
    if (starValue >= 1) {
      return (
        <span key={index} className={`${styles.star} ${styles.filled}`}>
          ★
        </span>
      );
    } else if (starValue > 0) {
      const percentage = starValue * 100;
      return (
        <span
          key={index}
          className={styles.star}
          style={{
            background: `linear-gradient(90deg, #ff9100 ${percentage}%, #ccc ${percentage}%)`,
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          ★
        </span>
      );
    } else {
      return (
        <span key={index} className={styles.star}>
          ★
        </span>
      );
    }
  };

  return (
    <div className={styles.averageRating}>
      {/* <p> Rate: {averageRating.toFixed(1)} / {totalStars}</p> */}
      <div className={styles.starsContainer}>
        {[...Array(totalStars)].map((_, index) => renderStar(index))}
      </div>
    </div>
  );
};

export default AverageRating;
