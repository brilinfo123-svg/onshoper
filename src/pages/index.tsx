"use client";

import Banner from "@/components/Banner/Index";
import Benefits from "@/components/Benefits/Index";
import Button from "@/components/Button/Index";
import SkeletonCard from "@/components/SkeletonCard/Index";
import ProductPost from "@/components/ProductPost/Index";
import India from "@/components/India/Index";
import Sidebar from "@/components/Sidebar/Index";
import styles from "@/styles/Home.module.scss";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import ProductMobile from "@/components/ProductMobile/Index";
import BannerPost from "@/components/BannerPost";
import FilterLocation from "@/components/FilterLocation/Index";
import { useCityFilter } from "@/contexts/CityFilterContext";
import IntroAnimation from "@/components/IntroAnimation/Index";
import Head from "@/components/Head";

interface Product {
  KmDriven: number;
  year: number;
  SalePrice: number;
  feature: boolean;
  shopOwnerID: string;
  subcategory: string;
  createdAt: string;
  coverImage: any;
  _id: string;
  title: string;
  category: string;
  type?: string;
  SaleType?: "Sale" | "Rent";
  price: number | string;
  priceWeek?: number | string;
  priceMonth?: number | string;
  images: string[];
  location?: {  // <-- Yahan change karo
    city?: string;
    area?: string;
    state?: string;
    // ... other location properties
  };
}

interface ShopData {
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
  registration: any;
  shop: any;
}


// Helper function to extract numeric value from price strings
const extractNumericValue = (price: any): number => {
  if (typeof price === 'number') return price;
  if (typeof price === 'string') {
    return parseFloat(price.replace(/[^\d.]/g, '')) || 0;
  }
  return 0;
};


export default function Home() {

  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [displayCount] = useState(10);
  // const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [filterType, setFilterType] = useState<"all" | "Sale" | "Rent">("all");
  const [visibleCount, setVisibleCount] = useState(10);
  


  const [products, setProducts] = useState<any[]>([]);
const [selectedCity, setSelectedCity] = useState<string>("All Cities");

  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);

  useEffect(() => {
    const savedCity = localStorage.getItem("selectedCity") || "All Cities";
    setSelectedCity(savedCity);
  }, []);

  console.log("location", products);
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        if (data.success) setProducts(data.products);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setProductsLoading(false);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // City filter function
  const filterProductsByCity = (products: Product[], city: string): Product[] => {
    if (city === "All Cities") return products;
    
    // Multiple fields mein search karo
    return products.filter(product => 
      product.location && (
        (product.location.city && product.location.city.toLowerCase().includes(city.toLowerCase())) ||
        (product.location.area && product.location.area.toLowerCase().includes(city.toLowerCase())) ||
        (product.location.state && product.location.state.toLowerCase().includes(city.toLowerCase()))
      )
    );
  };

  // Fetch shop data if user is logged in
  useEffect(() => {
    if (session?.user?.contact) {
      const fetchShopData = async () => {
        try {
          const response = await fetch(`/api/profile?userEmail=${session.user.contact}`);
          if (response.ok) {
            const data: ShopData = await response.json();
            setShopData(data);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };
      fetchShopData();
    }
  }, [session]);

  // Calculate product counts
  const { saleTotal, rentTotal, allTotal } = useMemo(() => {
    const saleTotal = products.filter((p) => (p.SaleType || p.type) === "Sale").length;
    const rentTotal = products.filter((p) => (p.SaleType || p.type) === "Rent").length;
    const allTotal = products.length;
    
    return { saleTotal, rentTotal, allTotal };
  }, [products]);

// Filter products based on selected criteria
// Filter products based on selected criteria
// Filter products based on selected criteria
const filteredProducts = useMemo(() => {
  let filtered = products.filter((product) => {
    // Apply Sale/Rent filter
    if (filterType !== "all" && (product.SaleType || product.type) !== filterType) {
      return false;
    }

    // Apply category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }

    // Apply subcategory filter
    if (selectedSubcategories.length > 0 && !selectedSubcategories.includes(product.subcategory || "")) {
      return false;
    }

    // Apply price filter - handle both Sale and Rent products
    
    return true;
  });

  // City filter apply karo
  filtered = filterProductsByCity(filtered, selectedCity);

  return filtered;
}, [products, filterType, selectedCategories, selectedSubcategories, selectedCity]);


  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Function to handle city change from FilterLocation component
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setVisibleCount(displayCount); // Reset visible count when city changes
  };
  
  useEffect(() => {
    fetch('/api/cleanup/expiredProducts', { method: 'DELETE' });
  }, []);


  return (
    <div className="main">
      <Head />
      <IntroAnimation />
      {/* <Banner bannerClass={styles.MobileSearch} contentClass={styles.contentWrap} /> */}
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
      
      {/* Yahan FilterLocation component add kiya hai */}
      {/* <FilterLocation onCityChange={handleCityChange} /> */}
      
      <div className="container">
        <div className={styles.rowFlex}>
          {/* Sidebar Filter */}
          {/* {productsLoading ? (
            <div className={styles.sidebarSkeleton}>
              <SkeletonCard />
            </div>
          ) : (
            <Sidebar
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
          )} */}

          {/* Products Section */}
          <div className={styles.productsSection}>
            {/* Selected city display */}
            {/* {selectedCity !== "All Cities" && (
              <div className={styles.selectedCity}>
                <h3>Showing products in: {selectedCity}</h3>
              </div>
            )} */}
            
            {/* Products Grid */}
            <div className={styles.productGrid}>
              {productsLoading ? (
                Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filteredProducts.length === 0 ? (
                <div className={styles.notFoundShops}>
                  <p>No products found for the selected filter</p>
                </div>
              ) : (
                filteredProducts
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
                      salaryFrom={product.salaryFrom}
                      salaryTo={product.salaryTo}
                      salaryPeriod={product.salaryPeriod}
                      positionType={product.positionType}
                    />
                  ))
              )}
            </div>

            {/* View More Button */}
            <div className={styles.btnAlign}>
              {!productsLoading && visibleCount < filteredProducts.length && (
                <div className={styles.viewMoreWrapper}>
                  <Button onClick={handleViewMore} children={"View More"} href={""} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Benefits />
    </div>
  );
}