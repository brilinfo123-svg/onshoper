"use client";
import { useRouter, useSearchParams } from "next/navigation";
import ProductPost from "@/components/ProductPost/Index";
import SkeletonCard from "@/components/SkeletonCard/Index";
import styles from "@/styles/filter.module.scss";
import FilterControls from "@/components/FilterControls/Index";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";
import { useFilter } from "@/contexts/FilterContext";
import Modal from "@/components/Modal/Index";

interface Product {
  status: string;
  brand: string;
  carBrand: any;
  year: number;
  KmDriven: number;
  positionType: string;
  salaryPeriod: string;
  salaryTo: number;
  salaryFrom: number;
  MobileModel: string;
  MobileBrand: string;
  type: any;
  SaleType: any;
  _id: string;
  title: string;
  description?: string;
  category: string;
  subcategory?: string;
  price?: string | number;
  priceWeek?: string | number;
  priceMonth?: string | number;
  SalePrice?: number;
  coverImage?: string;
  images?: string[];
  location?: {  // <-- Yahan change karo
    city?: string;
    area?: string;
    state?: string;
    // ... other location properties
  };
  createdAt?: string;
  feature?: boolean;
  shopOwnerID?: string;
}

interface ShopData {
  email: string;
  name: string;
  registration: any;
  shop: any;
  [key: string]: any;
}

const Filter: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchTerm = searchParams.get("searchTerm") || "";
  const city = searchParams.get("city") || "Select City";
  const categorySlug = searchParams.get("category") || "";
  const { filterType } = useFilter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const subcategoriesParam = searchParams.get("subcategories") || "";
  const subcategoriesFromUrl = subcategoriesParam ? subcategoriesParam.split(",") : [];
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  // const [filterType, setFilterType] = useState<"all" | "Sale" | "Rent">("all");
  const [showFilter, setShowFilter] = useState(false);
  const productsRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);


  // Unique brands for Cars
  // 1. Normalize subcategories from URL (lowercase trim)
  const normalizedSubcategories = selectedSubcategories.map((s) => s.toLowerCase());

  const filteredForBrandCounts = products.filter((p) => {
    const matchesCity =
      !city || city === "All Cities" || (p.location?.city || "").toLowerCase() === city.toLowerCase();

    const matchesSubcategory =
      selectedSubcategories.length === 0 ||
      (p.subcategory && normalizedSubcategories.includes(p.subcategory.toLowerCase()));

    return matchesCity && matchesSubcategory;
  });

  // 2. Unique brand extraction based on normalized subcategories

  const carBrandCounts = filteredForBrandCounts
    .filter((p) => p.category === "Car" && typeof p.carBrand === "string")
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.carBrand] = (acc[p.carBrand] || 0) + 1;
      return acc;
    }, {});

  const vehicleBrandCounts = filteredForBrandCounts
    .filter((p) => p.category === "Vehicles" && typeof p.brand === "string")
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.brand] = (acc[p.brand] || 0) + 1;
      return acc;
    }, {});

  const mobileBrandCounts = filteredForBrandCounts
    .filter((p) => p.category === "Mobiles" && typeof p.MobileBrand === "string")
    .reduce<Record<string, number>>((acc, p) => {
      acc[p.MobileBrand] = (acc[p.MobileBrand] || 0) + 1;
      return acc;
    }, {});

  const [selectedFilterBrand, setSelectedFilterBrand] = useState<{
    category: string;
    brand: string;
  } | null>(null);

  // Sync URL subcategories to state on mount or URL change
  useEffect(() => {
    if (subcategoriesFromUrl.length > 0 && !searchTerm) { // only sync if no searchTerm
      setSelectedSubcategories(subcategoriesFromUrl);
    } else if (searchTerm) {
      setSelectedSubcategories([]); // clear subcategories if searchTerm is active to avoid conflict
    }
  }, [subcategoriesParam, searchTerm]);

  // Fetch logged-in shop data
  useEffect(() => {
    if (session?.user?.contact) {
      fetch(`/api/profile?userEmail=${session.user.email}`)
        .then((res) => res.json())
        .then((data: ShopData) => setShopData(data))
        .catch((err) => console.error("Error fetching shop data:", err));
    }
  }, [session]);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/Search");
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      setProducts(data?.data || []);
      setFilteredProducts(data?.data || []);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const handleSubcategoryChange = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId) ? prev.filter((id) => id !== subcategoryId) : [...prev, subcategoryId]
    );
  };

  // Apply filters when dependencies change
  useEffect(() => {
    let filtered = [...products];

    // Filter by category slug
    if (categorySlug) {
      filtered = filtered.filter((p) => p.category === categorySlug);
    }

    // Apply brand filter if selected
    if (selectedFilterBrand) {
      const { category, brand } = selectedFilterBrand;

      if (category === "Car") {
        filtered = filtered.filter(
          (p) => p.category === "Car" && p.carBrand === brand
        );
      } else if (category === "Vehicles") {
        filtered = filtered.filter(
          (p) => p.category === "Vehicles" && p.brand === brand
        );
      } else if (category === "Mobiles") {
        filtered = filtered.filter(
          (p) => p.category === "Mobiles" && p.MobileBrand === brand
        );
      }
    }

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const searchWords = term.split(" ").filter(Boolean);

      filtered = filtered.filter((p: any) => {
        const fieldsToSearch = [
          p.title,
          p.category,
          p.subcategory,
          p.brand,
          p.model,
          p.MobileBrand,
          p.MobileModel,
          p.BicyclesBrand,
          p.carBrand,
          p.carModel,
          p.commercialBrand,
          p.commercialModel,
        ]
          .filter(Boolean)
          .map((field) => field.toLowerCase());

        return searchWords.every((word) =>
          fieldsToSearch.some((field) => field.includes(word))
        );
      });
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((p) => selectedCategories.includes(p.category));
    }

    // Subcategory filter
    if (selectedSubcategories.length > 0) {
      filtered = filtered.filter(
        (p) => p.subcategory && selectedSubcategories.includes(p.subcategory)
      );
    }

    // City filter
    if (city && city !== "Select City" && city !== "All Cities") {
      filtered = filtered.filter((p) =>
        (p.location?.city || "").toLowerCase() === city.toLowerCase()
      );
    }

    // ✅ Price filter
    if (minPrice !== "" || maxPrice !== "") {
      filtered = filtered.filter((p) => {
        let priceToCheck = 0;
        const type = p.SaleType || p.type;

        if (type === "Sale") {
          const rawSalePrice = p.SalePrice as string | number | undefined;

          if (typeof rawSalePrice === "string") {
            priceToCheck = parseFloat(rawSalePrice.replace(/[₹,]/g, "").trim()) || 0;
          } else if (typeof rawSalePrice === "number") {
            priceToCheck = rawSalePrice;
          } else {
            priceToCheck = 0;
          }
        } else if (type === "Rent") {
          const rentPrices: number[] = [];

          const clean = (val: string | number | undefined): number => {
            if (typeof val === "string") {
              return parseFloat(val.replace(/[^\d.]/g, "")) || 0;
            } else if (typeof val === "number") {
              return val;
            }
            return 0;
          };

          rentPrices.push(clean(p.price));
          rentPrices.push(clean(p.priceWeek));
          rentPrices.push(clean(p.priceMonth));

          const validPrices = rentPrices.filter((val) => val > 0);
          priceToCheck = validPrices.length ? Math.min(...validPrices) : 0;
        }

        if (minPrice !== "" && priceToCheck < cleanPrice(minPrice)) return false;
        if (maxPrice !== "" && priceToCheck > cleanPrice(maxPrice)) return false;
        return true;
      });
    }


    // ✅ Sale/Rent filter
    // ✅ Sale/Rent filter with fallback categories
    if (filterType !== "all") {
      const rentFallbackCategories = ["Services", "Jobs", "Education & Learning"];

      filtered = filtered.filter((p) => {
        const saleType = p.SaleType || p.type;
        const isRentType = saleType === "Rent";
        const isSaleType = saleType === "Sale";

        if (filterType === "Sale") {
          return isSaleType;
        }

        if (filterType === "Rent") {
          const isFallbackCategory = rentFallbackCategories.includes(p.category);
          return isRentType || (!saleType && isFallbackCategory);
        }

        return true;
      });
    }

    setFilteredProducts(filtered);
  }, [
    products,
    searchTerm,
    city,
    selectedCategories,
    selectedSubcategories,
    categorySlug,
    minPrice,
    maxPrice,
    filterType,
    selectedFilterBrand,
  ]);
  const cleanPrice = (value: string | number | undefined): number => {
    if (typeof value === "string") {
      const numeric = value.replace(/[₹,]/g, "").trim();
      return Number(numeric) || 0;
    }
    return typeof value === "number" ? value : 0;
  };





  if (error) return <div>{error}</div>;

  return (
    <>
      <Head>
        <title>
          {searchTerm
            ? `Search results for "${searchTerm}" – OnShoper`
            : subcategoriesFromUrl.length > 0
              ? `Browse ${subcategoriesFromUrl.join(", ")} in ${city} – OnShoper`
              : categorySlug
                ? `Browse ${categorySlug} in ${city} – OnShoper`
                : `Filtered Products – OnShoper`}
        </title>

        <meta
          name="description"
          content={
            searchTerm
              ? `Find listings matching "${searchTerm}" across categories on OnShoper.`
              : subcategoriesFromUrl.length > 0
                ? `Explore ${subcategoriesFromUrl.join(", ")} available in ${city} for sale or rent on OnShoper.`
                : categorySlug
                  ? `Explore ${categorySlug} available in ${city} for sale or rent on OnShoper.`
                  : `Discover filtered products and services tailored to your preferences on OnShoper.`
          }
        />

        {/* Optional: Social Sharing */}
        <meta property="og:title" content="Filtered Results – OnShoper" />
        <meta
          property="og:description"
          content="Find products for sale or rent by category, city, and price range on OnShoper."
        />
        <meta property="og:image" content="/images/og-filter.jpg" />
        <meta property="og:url" content={`https://onshoper.com/filter?category=${categorySlug}&city=${city}`} />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>

      <div className="main">
        <div className="container" id="products-section" ref={productsRef}>
          <FilterControls isVisible={showFilter} minPrice={minPrice}
            maxPrice={maxPrice}
            filterType={filterType}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
            // setFilterType={setFilterType}
            onApplyFilters={() => {
              // setVisibleCount(displayCount);
              setShowFilter(false);
            }}
            onClose={() => setShowFilter(false)}
          />

          <div className={styles.buttons}>
            <div className={styles.priceFilter}>
              <button className={styles.openFilterBtn} onClick={() => setShowFilter(true)}><span className="icon-sliders" />Filter By Price</button>
              <div className={styles.priceInput}>
                <label htmlFor="minPrice" className="icon-rupee">From</label>
                <input id="minPrice" type="number" placeholder="Min Price" value={minPrice} onChange={(e) =>
                  setMinPrice(e.target.value ? cleanPrice(e.target.value) : "")
                }
                />
              </div>
              <div className={styles.priceInput}>
                <label htmlFor="maxPrice" className="icon-rupee">To</label>
                <input
                  id="maxPrice"
                  type="number"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={(e) =>
                    setMaxPrice(e.target.value ? cleanPrice(e.target.value) : "")
                  }
                />
              </div>
            </div>
            <div>
              <button className={styles.filterByBrand} onClick={() => setIsModalOpen(true)}>Filter By Brands</button>

              <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>

                <>
                  <div className={styles.btnWrapper}>
                    {Object.keys(carBrandCounts).length > 0 && (
                      <div className={styles.brandWrap}>
                        <h4>Car Brands</h4>
                        <div className={styles.btnGroup}>
                          {Object.entries(carBrandCounts).map(([brand, count]) => (
                            <button
                              key={brand}
                              onClick={() => {
                                setSelectedFilterBrand({ category: "Car", brand });
                                setIsModalOpen(false);
                              }}
                              className={
                                selectedFilterBrand?.category === "Car" && selectedFilterBrand?.brand === brand
                                  ? styles.activeButton
                                  : ""
                              }
                            >
                              {brand} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(vehicleBrandCounts).length > 0 && (
                      <div className={styles.brandWrap}>
                        <h4>Bikes Brands</h4>
                        <div className={styles.btnGroup}>
                          {Object.entries(vehicleBrandCounts).map(([brand, count]) => (
                            <button
                              key={brand}
                              onClick={() => {
                                setSelectedFilterBrand({ category: "Vehicles", brand });
                                setIsModalOpen(false);
                              }}

                            >
                              {brand} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {Object.keys(mobileBrandCounts).length > 0 && (
                      <div className={styles.brandWrap}>
                        <h4>Mobile Brands</h4>
                        <div className={styles.btnGroup}>
                          {Object.entries(mobileBrandCounts).map(([brand, count]) => (
                            <button
                              key={brand}
                              onClick={() => {
                                setSelectedFilterBrand({ category: "Mobiles", brand });
                                setIsModalOpen(false);
                              }}
                              style={{
                                backgroundColor:
                                  selectedFilterBrand?.category === "Mobiles" && selectedFilterBrand?.brand === brand
                                    ? "blue"
                                    : "",
                                color: "black",
                                cursor: "pointer",
                              }}
                            >
                              {brand} ({count})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ✅ No Brands Message */}
                    {Object.keys(carBrandCounts).length === 0 &&
                      Object.keys(vehicleBrandCounts).length === 0 &&
                      Object.keys(mobileBrandCounts).length === 0 && (
                        <p className={styles.noBrands}>No brands available.</p>
                      )}
                    {/* Add a clear filter button */}
                    {selectedFilterBrand && (
                      <div className={styles.clearBrands}>
                        <button
                          onClick={() => {
                            setSelectedFilterBrand(null);
                            setIsModalOpen(false); // Close the modal after clearing
                          }}
                        >
                          Reset Filter
                        </button>
                      </div>
                    )}
                  </div>
                </>
              </Modal>
            </div>

          </div>
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
              onCategoryChange={handleCategoryChange}
              selectedSubcategories={selectedSubcategories}
              onSubcategoryChange={handleSubcategoryChange}
            />
          )} */}

            {/* Products Grid */}
            <div className={styles.productGrid}>
              {productsLoading ? (
                Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} />)
              ) : filteredProducts.length === 0 ? (
                <div className={styles.notFoundShops}>
                  <Image
                    src="/icons/not-found.png"
                    alt="not-found"
                    width={200}
                    height={200}
                    priority
                  />
                  {filterType === "Rent" ? (
                    <p>No Rented Products Available</p>
                  ) : filterType === "Sale" ? (
                    <p>No sale products available</p>
                  ) : selectedCategories.length > 0 ? (
                    <p>No products found in {selectedCategories.join(", ")}</p>
                  ) : (
                    <p>No products found</p>
                  )}
                </div>
              ) : (
                filteredProducts
                  .filter((product) => product.status === "active") // 👈 keep if you only want active
                  .sort((a, b) => (b.feature ? 1 : 0) - (a.feature ? 1 : 0))
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
                      SalePrice={product?.SalePrice}
                      coverImage={
                        product.coverImage || product.images?.[0] || "/images/DefoultLogo.jpg"
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
                      mobileBrand={product.MobileBrand}
                      mobileModel={product.MobileModel}
                      salaryFrom={product.salaryFrom}
                      salaryTo={product.salaryTo}
                      year={product.year}
                      KmDriven={product.KmDriven}
                      salaryPeriod={product.salaryPeriod}
                      positionType={product.positionType}
                    />
                  ))
              )}
            </div>


          </div>
        </div>
      </div>
    </>
  );
};

export default Filter;