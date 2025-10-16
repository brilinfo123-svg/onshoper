import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./Index.module.scss";
import { useRouter } from "next/router";

interface Product {
  _id: string;
  title: string;
  price: string;
  images?: string[];
  coverImage?: string;
  category: string;
  subcategory: string;
}

interface Props {
  category: string;
  subcategory: string;
  currentProductId: string;
}

const RelatedProducts: React.FC<Props> = ({ category, subcategory, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [emblaRef] = useEmblaCarousel({ loop: true });
  const router = useRouter();

  useEffect(() => {
    const fetchRelated = async () => {
      try {
        const res = await fetch(`/api/productsRelate?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`);
        const data = await res.json();
        console.log("API response:", data); // ✅ Debug log
  
        const filtered = data.filter((p: Product) => p._id !== currentProductId);
        console.log("Filtered products:", filtered); // ✅ See what's left
  
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("❌ Error fetching related products:", err);
      }
    };
  
    if (category && subcategory) fetchRelated();
  }, [category, subcategory, currentProductId]);
  

  if (!relatedProducts.length) {
    return (
      <div className={styles.relatedWrapper}>
        <p>No related products found.</p>
      </div>
    );
  }

  return (
    <div className={styles.relatedWrapper}>
      <h2 className={styles.heading}>Related Products</h2>
      <p className={styles.count}>Found {relatedProducts.length} items</p>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {relatedProducts.map((product) => (
            <div className={styles.emblaSlide} key={product._id}>
              <div className={styles.card}>
                <img
                  src={product.images?.[0] || product.coverImage || "/placeholder.jpg"}
                  alt={product.title}
                  className={styles.image}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.jpg";
                  }}
                />
                <h3 className={styles.title}>{product.title}</h3>
                <p className={styles.price}>{product.price}</p>
                <button
                  className={styles.button}
                  onClick={() => router.push(`/product/${product._id}`)}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
