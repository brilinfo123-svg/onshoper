import React, { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./Index.module.scss";
import ProductPost from "@/components/ProductPost/Index";

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
  city: string;
  state: string;
}

const RelatedProducts: React.FC<Props> = ({
  category,
  subcategory,
  currentProductId,
  city,
  state,
}) => {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  const [emblaRef] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
  });

  useEffect(() => {
    const fetchRelated = async () => {
      if (!category && !subcategory) return;

      try {
        const res = await fetch(
          `/api/productsRelate?category=${encodeURIComponent(
            category
          )}&subcategory=${encodeURIComponent(
            subcategory
          )}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`
        );

        const data = await res.json();
        // console.log("API response:", data);

        const filtered = Array.isArray(data)
          ? data.filter((p: Product) => p._id !== currentProductId)
          : [];

        // console.log("Filtered products:", filtered);
        setRelatedProducts(filtered);
      } catch (err) {
        console.error("❌ Error fetching related products:", err);
      }
    };

    fetchRelated();
  }, [category, subcategory, currentProductId, city, state]);

  if (!relatedProducts.length) {
    return (
      <div className={styles.relatedWrapper}>
        <p className={styles.NoRelatedPro}>No related products found.</p>
      </div>
    );
  }

  return (
    <div className={styles.relatedWrapper}>
      <h3 className={styles.heading}>Related Products</h3>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {relatedProducts.map((product) => (
            <div className={styles.emblaSlide} key={product._id}>
              <ProductPost
                key={product._id}
                _id={product._id}
                title={product.title}
                description=""
                category={product.category}
                subCategory={product.subcategory}
                price={Number(product.price)}
                priceWeek={
                  product.priceWeek ? Number(product.priceWeek) : undefined
                }
                priceMonth={
                  product.priceMonth ? Number(product.priceMonth) : undefined
                }
                SalePrice={product.SalePrice}
                coverImage={
                  product.coverImage ||
                  product.images?.[0] ||
                  "/images/DefoultLogo.jpg"
                }
                images={product.images || []}
                location={{
                  city: product.location?.city || "",
                  area: product.location?.area || "",
                  state: product.location?.state || "",
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
