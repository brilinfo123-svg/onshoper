import { useRouter } from "next/router";
import styles from "@/styles/shopedetail.module.scss";

// Static data for shop details
const shopData = [
  {
    slug: "shop-one",
    name: "Shop One",
    description: "A great shop for all your needs.",
    images: ["/image1.jpg", "/image2.jpg"],
    rating: 4.5,
    location: {
      address: "123 Main St, City, Country",
      hours: "9:00 AM - 8:00 PM",
    },
    products: [
      { id: 1, name: "Product 1", price: "$20" },
      { id: 2, name: "Product 2", price: "$40" },
    ],
    reviews: [
      { user: "John", rating: 5, comment: "Great shop!" },
      { user: "Jane", rating: 4, comment: "Nice products." },
    ],
  },
  {
    slug: "shop-two",
    name: "Shop Two",
    description: "Another great shop for awesome products.",
    images: ["/image3.jpg", "/image4.jpg"],
    rating: 3.8,
    location: {
      address: "456 Another St, City, Country",
      hours: "10:00 AM - 6:00 PM",
    },
    products: [
      { id: 1, name: "Product A", price: "$30" },
      { id: 2, name: "Product B", price: "$50" },
    ],
    reviews: [
      { user: "Alice", rating: 4, comment: "I like this shop." },
      { user: "Bob", rating: 3, comment: "Good, but could improve." },
    ],
  },
];

const ShopDetailPage = ({ shopData }) => {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  const { name, description, images, rating, location, products, reviews } = shopData;

  return (
    <div className={styles.shopDetailContainer}>
      {/* Shop Details Section */}
      <div className={styles.shopDetails}>
        <h1 className={styles.shopName}>{name}</h1>
        <p className={styles.shopDescription}>{description}</p>
        <div className={styles.gallery}>
          {images.map((img, idx) => (
            <img key={idx} src={img} alt={`Shop Image ${idx + 1}`} className={styles.shopImage} />
          ))}
        </div>
        <div className={styles.info}>
          <p><strong>Rating:</strong> {rating} / 5</p>
          <p><strong>Address:</strong> {location.address}</p>
          <p><strong>Hours:</strong> {location.hours}</p>
        </div>
      </div>

      {/* Products Section */}
      <div className={styles.productGrid}>
        <h2>Products</h2>
        <div className={styles.products}>
          {products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className={styles.reviews}>
        <h2>Reviews</h2>
        {reviews.map((review, idx) => (
          <div key={idx} className={styles.review}>
            <p><strong>{review.user}</strong> - {review.rating} / 5</p>
            <p>{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fetch all shop slugs
export async function getStaticPaths() {
  const paths = shopData.map((shop) => ({
    params: { slug: shop.slug },
  }));

  return { paths, fallback: true }; // fallback: true to support on-demand builds
}

// Fetch shop details based on slug
export async function getStaticProps({ params }) {
  const shop = shopData.find((shop) => shop.slug === params.slug);

  return {
    props: { shopData: shop || null },
  };
}

export default ShopDetailPage;
