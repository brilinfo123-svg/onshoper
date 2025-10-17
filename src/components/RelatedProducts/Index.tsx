import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./Index.module.scss";
import ProductPost from "@/components/ProductPost/Index";
import { useRouter } from "next/router";

interface Product {
  positionType: string;
  salaryPeriod: string;
  salaryTo: number;
  MobileModel: string;
  MobileBrand: string;
  KmDriven: number;
  year: number;
  feature: boolean;
  shopOwnerID: string;
  createdAt: string;
  location: any;
  SalePrice: number;
  priceMonth: any;
  priceWeek: any;
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

  
    const [emblaRef, emblaApi] = useEmblaCarousel({ 
      loop: false,
      align: "start",
      slidesToScroll: 1,
      dragFree: true,
    }, []);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!category && !subcategory) return;

      try {
        const res = await fetch(
          `/api/productsRelate?category=${encodeURIComponent(category)}&subcategory=${encodeURIComponent(subcategory)}`
        );
        const data = await res.json();
        console.log("API response:", data);

        // Exclude current product
        const filtered = Array.isArray(data)
          ? data.filter((p: Product) => p._id !== currentProductId)
          : [];

        console.log("Filtered products:", filtered);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("❌ Error fetching related products:", err);
      }
    };

    fetchRelated();
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
      {/* <p className={styles.count}>Found {relatedProducts.length} items</p> */}
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
        {relatedProducts.map((product) => (
          <div className={styles.emblaSlide} key={product._id}>
            <ProductPost
              key={product._id}
              _id={product._id}
              title={product.title}
              description={""}
              category={product.category}
              subCategory={product.subcategory}
              price={Number(product.price)}
              priceWeek={product.priceWeek ? Number(product.priceWeek) : undefined}
              priceMonth={product.priceMonth ? Number(product.priceMonth) : undefined}
              SalePrice={product.SalePrice}
              coverImage={product.coverImage || product.images?.[0] || "/images/img2.jpg"}
              images={product.images || []}
              location={{
                city: product.location?.city || "",
                area: product.location?.area || "",
                state: product.location?.state || ""
              }}
              createdAt={product.createdAt}
              isFeatured={product.feature || false}
              shopOwnerID={product.shopOwnerID}
              year={product.year}
              KmDriven={product.KmDriven}
              mobileBrand={product.MobileBrand}
              mobileModel={product.MobileModel}
              salaryFrom={product.salaryTo}
              salaryTo={product.salaryTo}
              salaryPeriod={product.salaryPeriod}
              positionType={product.positionType}
            />
          </div>
        ))}

        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
