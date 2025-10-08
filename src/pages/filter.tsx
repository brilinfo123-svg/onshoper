"use client";
import { useRouter, useSearchParams } from "next/navigation";
import ProductPost from "@/components/ProductPost/Index";
import SkeletonCard from "@/components/SkeletonCard/Index";
import styles from "@/styles/filter.module.scss";
import FilterControls from "@/components/FilterControls/Index";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Head from "next/head";

interface Product {
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
  const [selectedCity, setSelectedCity] = useState<string>("Select City");

  // Read subcategories from URL query param and split to array
  const subcategoriesParam = searchParams.get("subcategories") || "";
  const subcategoriesFromUrl = subcategoriesParam ? subcategoriesParam.split(",") : [];

  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(12);
  const [minPrice, setMinPrice] = useState<number | "">("");
  const [maxPrice, setMaxPrice] = useState<number | "">("");
  const [filterType, setFilterType] = useState<"all" | "Sale" | "Rent">("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const [showFilter, setShowFilter] = useState(false);

  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);

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
    if (filterType !== "all") {
      filtered = filtered.filter((p) => (p.SaleType || p.type) === filterType);
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
      <div className="container">
        <FilterControls
          isVisible={showFilter} // ✅ pass visibility as prop
          minPrice={minPrice}
          maxPrice={maxPrice}
          filterType={filterType}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          setFilterType={setFilterType}
          onApplyFilters={() => {
            setVisibleCount(displayCount);
            setShowFilter(false);
          }}
          onClose={() => setShowFilter(false)}
        />

        <div className={styles.buttons}>
          <div className={styles.priceFilter}>
            <button className={styles.openFilterBtn} onClick={() => setShowFilter(true)}><span className="icon-filter" />Filter</button>
            <div className={styles.priceInput}>
              <label htmlFor="minPrice" className="icon-rupee">From</label>
              <input
                id="minPrice"
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) =>
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
          <div className={styles.btnWrapper}>
            <button className={filterType === "Sale" ? styles.activeBtn : ""} onClick={() => { setFilterType("Sale"); setVisibleCount(displayCount); }}>
              Buy
              {/* ({saleTotal}) */}
            </button>
            <button className={filterType === "Rent" ? styles.activeBtn : ""}
              onClick={() => { setFilterType("Rent"); setVisibleCount(displayCount); }}>
              Rent
              {/* ({rentTotal}) */}
            </button>
            <button
              className={filterType === "all" ? styles.activeBtn : ""}
              onClick={() => { setFilterType("all"); setVisibleCount(displayCount); }}
            >
              See All
              {/* ({allTotal}) */}
            </button>
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
                  width={200} // ✅ set your desired width
                  height={200} // ✅ set your desired height
                  priority // optional: load immediately
                />
                <p>No products found for the selected categories</p>
              </div>
            ) : (
              filteredProducts
                .sort((a, b) => (b.feature ? 1 : 0) - (a.feature ? 1 : 0))
                .slice(0, displayCount)
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
                      product.coverImage || product.images?.[0] || "/images/img2.jpg"
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