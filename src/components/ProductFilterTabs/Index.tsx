"use client";
import React, { useState, useEffect } from "react";
import styles from "./Index.module.scss";
import SkeletonCard from "../SkeletonCard/Index";
import ProductPost from "@/components/ProductPost/Index";

interface Product {
  KmDriven: number;
  year: number;
  type: string;
  _id: string;
  title: string;
  description?: string;
  SaleType?: "Sale" | "Rent";
  SalePrice?: number;
  price?: number;
  priceWeek?: number;
  priceMonth?: number;
  rentalType?: string;
  location?: string;
  feature?: boolean;
  coverImage?: string;
  images?: string[];
  category?: string;
  subcategory?: string;
  createdAt: string;
  shopOwnerID?: string;
}

interface Props {
  products: Product[];
  productsLoading: boolean;
  displayCount: number;
}

const WatchFilter: React.FC<Props> = ({ products, productsLoading, displayCount }) => {
  const [filterType, setFilterType] = useState<"all" | "Sale" | "Rent">("all");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [visibleCount, setVisibleCount] = useState(displayCount);

  useEffect(() => {
    if (!Array.isArray(products)) {
      console.log("⚠️ products is not an array:", products);
      setFilteredProducts([]);
      return;
    }

    if (filterType === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => {
          const type = p.SaleType || p.type; // ✅ fixed here (was duplicate before)
          return type === filterType;
        })
      );
    }

    // reset visible count when filter changes
    setVisibleCount(displayCount);
  }, [filterType, products, displayCount]);

  // ✅ pre-calculate totals (so we don’t call filter multiple times in render)
  const saleTotal = products.filter((p) => (p.SaleType || p.type) === "Sale").length;
  const rentTotal = products.filter((p) => (p.SaleType || p.type) === "Rent").length;
  const allTotal = products.length;

  return (
    <div className="container">
      <div className={styles.wrapper}>
        {/* Filter Buttons */}
        <div className={styles.buttons}>
          <button
            className={filterType === "Sale" ? styles.activeBtn : ""}
            onClick={() => setFilterType("Sale")}
          >
            Buy ({saleTotal})
            {filterType === "Sale" && ``}
          </button>

          <button
            className={filterType === "Rent" ? styles.activeBtn : ""}
            onClick={() => setFilterType("Rent")}
          >
            Rent ({rentTotal})
            {filterType === "Rent" && ``}
          </button>

          <button
            className={filterType === "all" ? styles.activeBtn : ""}
            onClick={() => setFilterType("all")}
          >
            All ({allTotal})
            {filterType === "all" && ``}
          </button>
        </div>

        {/* Products Grid */}
        <div className={styles.productGrid}>
          {productsLoading ? (
            Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
          ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
            <div className={styles.notFoundShops}>
              <p>No products found for the selected filter</p>
            </div>
          ) : (
            [...filteredProducts]
              .sort((a, b) => (b.feature ? 1 : 0) - (a.feature ? 1 : 0))
              .slice(0, visibleCount)
              .map((product) => (
                <ProductPost
                  key={product._id}
                  _id={product._id}
                  title={product.title}
                  description={""}
                  category={product.category || ""}
                  subCategory={product.subcategory || ""}
                  price={Number(product.price) || 0}
                  priceWeek={product.priceWeek !== undefined ? Number(product.priceWeek) : undefined}
                  priceMonth={product.priceMonth !== undefined ? Number(product.priceMonth) : undefined}
                  SalePrice={product.SalePrice}
                  coverImage={product.coverImage || product.images?.[0] || "/images/img2.jpg"}
                  images={product.images || []}
                  location={{
                    city: product.location || "",
                    area: product.location || "", 
                    state: product.location || ""
                  }}
                  createdAt={product.createdAt}
                  isFeatured={product.feature || false}
                  shopOwnerID={product.shopOwnerID || ""}
                  year={product.year}
                  KmDriven={product.KmDriven}
                />
              ))
          )}
        </div>

        {/* ✅ View More Button */}
        {!productsLoading && visibleCount < filteredProducts.length && (
          <div className={styles.viewMoreWrapper}>
            <button onClick={() => setVisibleCount((prev) => prev + displayCount)}>
              View More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchFilter;
