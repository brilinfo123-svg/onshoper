import styles from "./Index.module.scss";

interface ReviewListProps {
  reviews: { rating: number; comment: string }[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className={styles.allReviewContainer}>
      {reviews.length > 0 ? (
        reviews.map((review, index) => (
          <div key={index} className={styles.reviewItem}>
            <div className={styles.starsContainer}>
              {[...Array(5)].map((_, starIndex) => (
                <span key={starIndex} className={`${styles.star} ${starIndex < review.rating ? styles.filled : ""}`}>
                  ★
                </span>
              ))}
            </div>
            <p className={styles.comments}>
              <i>{review.comment}</i>
            </p>
          </div>
        ))
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default ReviewList;
