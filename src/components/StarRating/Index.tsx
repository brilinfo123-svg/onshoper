import styles from "./Index.module.scss";

interface StarRatingProps {
  rating: number;
  hoverRating?: number;
  onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, hoverRating, onRatingChange }) => {
  const totalStars = 5;

  return (
    <div className={styles.ratingSection}>
      <h3>Rate:</h3>
      {[...Array(totalStars)].map((_, index) => (
        <span
          key={index}
          onClick={() => onRatingChange && onRatingChange(index + 1)}
          onMouseEnter={() => onRatingChange && onRatingChange(index + 1)}
          onMouseLeave={() => onRatingChange && onRatingChange(rating)} // Ensure it keeps the selected rating
          className={`${styles.star} ${index < (hoverRating || rating) ? styles.active : ""}`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
