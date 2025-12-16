"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useFilter } from "@/contexts/FilterContext";
import { useProducts } from "@/contexts/ProductContext";

import Button from "@/components/Button/Index";
import SkeletonCard from "@/components/SkeletonCard/Index";
import ProductPost from "@/components/ProductPost/Index";
import ProductMobile from "@/components/ProductMobile/Index";
import BannerPost from "@/components/BannerPost";
import IntroAnimation from "@/components/IntroAnimation/Index";
import Head from "@/components/Head";
import styles from "@/styles/Home.module.scss";

interface Product {
  _id: string;
  title: string;
  category: string;
  subcategory: string;
  SaleType?: "Sale" | "Rent";
  type?: string;
  feature: boolean;
  coverImage: any;
  images: string[];
  price: number | string;
  priceWeek?: number | string;
  priceMonth?: number | string;
  SalePrice: number;
  location?: {
    city?: string;
    area?: string;
    state?: string;
  };
  createdAt: string;
  shopOwnerID: string;
  year: number;
  KmDriven: number;
  MobileBrand?: string;
  MobileModel?: string;
  salaryFrom?: number;
  salaryTo?: number;
  salaryPeriod?: string;
  positionType?: string;
}

export default function Home() {
  const { data: session } = useSession();
  const { filterType } = useFilter();

  // ✅ Products from context
  const { products, setProducts, loaded, setLoaded } = useProducts();
  console.log("Products in context:", products);

  const [productsLoading, setProductsLoading] = useState(!loaded);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>("All Cities");
  const [visibleCount, setVisibleCount] = useState(10);

  const productsRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ✅ Fetch products only once per session
  useEffect(() => {
    if (!loaded) {
      const fetchProducts = async () => {
        try {
          const res = await fetch("/api/products");
          const data = await res.json();
          if (data.success) {
            setProducts(data.products);
            setLoaded(true);
          }
        } catch (err) {
          console.error("Error fetching products:", err);
        } finally {
          setProductsLoading(false);
        }
      };
      fetchProducts();
    } else {
      setProductsLoading(false);
    }
  }, [loaded, setProducts, setLoaded]);

  // ✅ Infinite scroll observer
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 10);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }
    );
    observer.observe(loadMoreRef.current);
    return () => {
      if (loadMoreRef.current) observer.unobserve(loadMoreRef.current);
    };
  }, [products]);

  // ✅ City filter
  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity") || "All Cities";
    setSelectedCity(savedCity);
  }, []);

  const filterProductsByCity = (products: Product[], city: string): Product[] => {
    if (city === "All Cities") return products;
    return products.filter(
      (product) =>
        product.location &&
        ((product.location.city &&
          product.location.city.toLowerCase().includes(city.toLowerCase())) ||
          (product.location.area &&
            product.location.area.toLowerCase().includes(city.toLowerCase())) ||
          (product.location.state &&
            product.location.state.toLowerCase().includes(city.toLowerCase())))
    );
  };

  // ✅ Filter products
  const filteredProducts = useMemo(() => {
    const rentFallbackCategories = ["Services", "Jobs", "Education & Learning"];
    let filtered = products.filter((product) => {
      const saleType = product.SaleType || product.type;
      if (filterType === "Rent") {
        const isRentType = saleType === "Rent";
        const isFallbackCategory = rentFallbackCategories.includes(product.category);
        if (!isRentType && !isFallbackCategory) return false;
      }
      if (filterType === "Sale" && saleType !== "Sale") return false;
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      )
        return false;
      if (
        selectedSubcategories.length > 0 &&
        !selectedSubcategories.includes(product.subcategory || "")
      )
        return false;
      return true;
    });
    filtered = filterProductsByCity(filtered, selectedCity);
    return filtered;
  }, [products, filterType, selectedCategories, selectedSubcategories, selectedCity]);

  return (
    <div className="main">
      <Head />
      <IntroAnimation />
      <div className="container">
        <ProductMobile
          products={products}
          selectedCategories={selectedCategories}
          onCategoryChange={(id) =>
            setSelectedCategories((prev) =>
              prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
            )
          }
          selectedSubcategories={selectedSubcategories}
          onSubcategoryChange={(sub) =>
            setSelectedSubcategories((prev) =>
              prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]
            )
          }
        />
      </div>
      <BannerPost />
      <div className="container">
        <div className={styles.rowFlex} id="products-section" ref={productsRef}>
          <div className={styles.productsSection}>
            {productsLoading ? (
              <div className={styles.productGrid}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.notFoundShops}>
                <p>No products found for the selected filter</p>
              </div>
            ) : (
              <div className={styles.productGrid}>
                {filteredProducts
                  .sort((a, b) => (b.feature ? 1 : 0) - (a.feature ? 1 : 0))
                  .slice(0, visibleCount)
                  .map((product) => (
                    <ProductPost
                      key={product._id}
                      _id={product._id}
                      title={product.title}
                      description={""}
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
                      salaryFrom={product.salaryFrom}
                      salaryTo={product.salaryTo}
                      salaryPeriod={product.salaryPeriod}
                      positionType={product.positionType}
                    />
                  ))}
              </div>
            )}
            <div ref={loadMoreRef} className={styles.loadMoreTrigger}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
