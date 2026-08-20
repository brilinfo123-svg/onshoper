import React, { useMemo, useState } from "react";
import styles from "./Index.module.scss";

interface Product {
  _id: string;
  category?: string;
  subcategory?: string;

  SaleType?: string;
  type?: string;

  SalePrice?: string | number;

  price?: string | number;
  priceWeek?: string | number;
  priceMonth?: string | number;

  condition?: string;

  carBrand?: string;
  brand?: string;
  MobileBrand?: string;

  location?: {
    city?: string;
    area?: string;
    state?: string;
  };

  createdAt?: string;
}

interface FiltersProps {
  products: Product[];

  minPrice: number | "";
  maxPrice: number | "";

  setMinPrice: React.Dispatch<React.SetStateAction<number | "">>;
  setMaxPrice: React.Dispatch<React.SetStateAction<number | "">>;

  selectedFilterBrand: {
    category: string;
    brand: string;
  } | null;

  setSelectedFilterBrand: React.Dispatch<
    React.SetStateAction<{
      category: string;
      brand: string;
    } | null>
  >;

  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  city: string;
  setSelectedCity: React.Dispatch<React.SetStateAction<string>>;

  selectedCondition: string;
  setSelectedCondition: React.Dispatch<
    React.SetStateAction<string>
  >;

  sortBy: string;
  setSortBy: React.Dispatch<React.SetStateAction<string>>;

  onReset: () => void;
  onApplyFilters?: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  products,

  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,

  selectedFilterBrand,
  setSelectedFilterBrand,

  selectedCategories,
  setSelectedCategories,

  city,
  setSelectedCity,

  selectedCondition,
  setSelectedCondition,

  sortBy,
  setSortBy,

  onReset,
  onApplyFilters,
}) => {
  /*
  |--------------------------------------------------------------------------
  | PRICE CLEANER
  |--------------------------------------------------------------------------
  */

  const cleanPrice = (
    value: string | number | undefined
  ): number => {
    if (typeof value === "number") {
      return value;
    }

    if (typeof value === "string") {
      return (
        parseFloat(
          value.replace(/[₹,\s]/g, "")
        ) || 0
      );
    }

    return 0;
  };

  /*
  |--------------------------------------------------------------------------
  | GET PRODUCT PRICE
  |--------------------------------------------------------------------------
  */

  const getProductPrice = (product: Product): number => {
    const salePrice = cleanPrice(product.SalePrice);

    if (salePrice > 0) {
      return salePrice;
    }

    const prices = [
      cleanPrice(product.price),
      cleanPrice(product.priceWeek),
      cleanPrice(product.priceMonth),
    ].filter((price) => price > 0);

    return prices.length
      ? Math.min(...prices)
      : 0;
  };

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC MAX PRICE
  |--------------------------------------------------------------------------
  */

  const priceMaximum = useMemo(() => {
    const prices = products
      .map(getProductPrice)
      .filter((price) => price > 0);

    if (!prices.length) {
      return 200000;
    }

    const highestPrice = Math.max(...prices);

    // Round up to nearest 10,000
    const roundedPrice =
      Math.ceil(highestPrice / 10000) * 10000;

    return Math.max(roundedPrice, 10000);
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | CURRENT PRICE VALUES
  |--------------------------------------------------------------------------
  */

  const currentMinPrice =
    typeof minPrice === "number"
      ? Math.min(minPrice, priceMaximum)
      : 0;

  const currentMaxPrice =
    typeof maxPrice === "number" &&
    maxPrice > 0
      ? Math.min(maxPrice, priceMaximum)
      : priceMaximum;

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC CATEGORIES
  |--------------------------------------------------------------------------
  */

  const categories = useMemo(() => {
    const categoryMap = new Map<
      string,
      number
    >();

    products.forEach((product) => {
      if (!product.category) return;

      categoryMap.set(
        product.category,
        (categoryMap.get(product.category) || 0) + 1
      );
    });

    return Array.from(categoryMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC CITIES
  |--------------------------------------------------------------------------
  */

  const cities = useMemo(() => {
    const cityMap = new Map<
      string,
      number
    >();

    products.forEach((product) => {
      const cityName =
        product.location?.city?.trim();

      if (!cityName) return;

      cityMap.set(
        cityName,
        (cityMap.get(cityName) || 0) + 1
      );
    });

    return Array.from(cityMap.entries())
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC CONDITIONS
  |--------------------------------------------------------------------------
  */

  const conditions = useMemo(() => {
    const conditionMap = new Map<
      string,
      number
    >();

    products.forEach((product) => {
      const condition =
        product.condition?.trim();

      if (!condition) return;

      conditionMap.set(
        condition,
        (conditionMap.get(condition) || 0) + 1
      );
    });

    return Array.from(
      conditionMap.entries()
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) =>
        a.name.localeCompare(b.name)
      );
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | DYNAMIC BRANDS
  |--------------------------------------------------------------------------
  */

  const allBrands = useMemo(() => {
    const brandMap = new Map<
      string,
      {
        category: string;
        brand: string;
        count: number;
      }
    >();

    products.forEach((product) => {
      let brand = "";
      let category = "";

      if (
        product.category === "Car" &&
        product.carBrand
      ) {
        brand = product.carBrand;
        category = "Car";
      }

      else if (
        product.category === "Vehicles" &&
        product.brand
      ) {
        brand = product.brand;
        category = "Vehicles";
      }

      else if (
        product.category === "Mobiles" &&
        product.MobileBrand
      ) {
        brand = product.MobileBrand;
        category = "Mobiles";
      }

      if (!brand || !category) return;

      const key = `${category}-${brand}`;

      const existing =
        brandMap.get(key);

      if (existing) {
        existing.count += 1;
      } else {
        brandMap.set(key, {
          category,
          brand,
          count: 1,
        });
      }
    });

    return Array.from(
      brandMap.values()
    ).sort((a, b) =>
      a.brand.localeCompare(b.brand)
    );
  }, [products]);

  /*
  |--------------------------------------------------------------------------
  | SHOW BRANDS
  |--------------------------------------------------------------------------
  */

  const [showAllBrands, setShowAllBrands] =
    useState(false);

  const visibleBrands = showAllBrands
    ? allBrands
    : allBrands.slice(0, 6);

  /*
  |--------------------------------------------------------------------------
  | PRICE HANDLERS
  |--------------------------------------------------------------------------
  */

  const handleMinPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (!value) {
      setMinPrice("");
      return;
    }

    const number = cleanPrice(value);

    if (number <= currentMaxPrice) {
      setMinPrice(number);
    }
  };

  const handleMaxPriceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (!value) {
      setMaxPrice("");
      return;
    }

    const number = cleanPrice(value);

    if (number >= currentMinPrice) {
      setMaxPrice(number);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | RESET
  |--------------------------------------------------------------------------
  */

  const handleReset = () => {
    setSelectedCondition("All");
    setSortBy("Newest First");
  
    setSelectedFilterBrand(null);
    setSelectedCategories([]);
  
    setMinPrice("");
    setMaxPrice("");
  
    setSelectedCity("All Cities");
  
    onReset();
  };

  return (
    <aside className={styles.filters}>

      {/* HEADER */}

      <div className={styles.filterHeader}>
        <h2>Filters</h2>

        <button
          type="button"
          className={styles.resetAll}
          onClick={handleReset}
        >
          <span className={styles.resetIcon}>
            ↻
          </span>

          Reset All
        </button>
      </div>

      <div className={styles.filterBody}>

        {/* =================================================
            CATEGORY
        ================================================= */}

        <div className={styles.filterSection}>
          <h3>Category</h3>

          <div className={styles.selectWrapper}>
            <select
              value={
                selectedCategories[0] || ""
              }
              onChange={(e) => {
                const value =
                  e.target.value;

                setSelectedCategories(
                  value ? [value] : []
                );
              }}
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                ({ name, count }) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name} ({count})
                  </option>
                )
              )}
            </select>

            <span
              className={styles.selectArrow}
            >
             ⌄
            </span>
          </div>
        </div>

        {/* =================================================
            PRICE
        ================================================= */}

        <div className={styles.filterSection}>
          <h3>Price Range</h3>

          <div className={styles.rangeWrapper}>

            <div
              className={styles.rangeTrack}
            />

            <input
              type="range"
              min="0"
              max={priceMaximum}
              value={currentMinPrice}
              onChange={(e) => {
                const value =
                  Number(e.target.value);

                if (
                  value <= currentMaxPrice
                ) {
                  setMinPrice(value);
                }
              }}
              className={`${styles.rangeInput} ${styles.rangeMin}`}
            />

            <input
              type="range"
              min="0"
              max={priceMaximum}
              value={currentMaxPrice}
              onChange={(e) => {
                const value =
                  Number(e.target.value);

                if (
                  value >= currentMinPrice
                ) {
                  setMaxPrice(value);
                }
              }}
              className={`${styles.rangeInput} ${styles.rangeMax}`}
            />
          </div>

          <div className={styles.rangeLabels}>
            <span>
              ₹
              {currentMinPrice.toLocaleString(
                "en-IN"
              )}
            </span>

            <span>
              ₹
              {currentMaxPrice.toLocaleString(
                "en-IN"
              )}
              {currentMaxPrice >=
              priceMaximum
                ? "+"
                : ""}
            </span>
          </div>

          <div className={styles.priceInputs}>

            <div
              className={styles.priceInput}
            >
              <span>₹</span>

              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={
                  handleMinPriceChange
                }
              />
            </div>

            <div
              className={styles.priceInput}
            >
              <span>₹</span>

              <input
                type="number"
                placeholder={priceMaximum.toLocaleString(
                  "en-IN"
                )}
                value={maxPrice}
                onChange={
                  handleMaxPriceChange
                }
              />
            </div>

          </div>
        </div>

        {/* =================================================
            LOCATION
        ================================================= */}

        <div className={styles.filterSection}>
          <h3>Location</h3>

          <div className={styles.selectWrapper}>
            <select
              value={
                city === "Select City"
                  ? "All Cities"
                  : city
              }
              onChange={(e) =>
                setSelectedCity(
                  e.target.value
                )
              }
            >
              <option value="All Cities">
                All India
              </option>

              {cities.map(
                ({ name, count }) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name} ({count})
                  </option>
                )
              )}
            </select>

            <span
              className={styles.selectArrow}
            >
              ⌄
            </span>
          </div>
        </div>

        {/* =================================================
            CONDITION
        ================================================= */}

        <div className={styles.filterSection}>
          <h3>Condition</h3>

          <div className={styles.optionGrid}>

            <button
              type="button"
              className={
                selectedCondition === "All"
                  ? styles.optionActive
                  : styles.optionButton
              }
              onClick={() =>
                setSelectedCondition("All")
              }
            >
              All
            </button>

            {conditions.map(
              ({ name }) => (
                <button
                  key={name}
                  type="button"
                  className={
                    selectedCondition ===
                    name
                      ? styles.optionActive
                      : styles.optionButton
                  }
                  onClick={() =>
                    setSelectedCondition(
                      name
                    )
                  }
                >
                  {name}
                </button>
              )
            )}

          </div>
        </div>

        {/* =================================================
            POSTED WITHIN
        ================================================= */}

        {/* =================================================
            SORT
        ================================================= */}

        <div className={styles.filterSection}>
          <h3>Sort By</h3>

          <div className={styles.selectWrapper}>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value)
              }
            >
              <option value="Newest First">
                Newest First
              </option>

              <option value="Oldest First">
                Oldest First
              </option>

              <option value="Price Low to High">
                Price: Low to High
              </option>

              <option value="Price High to Low">
                Price: High to Low
              </option>
            </select>

            <span
              className={styles.selectArrow}
            >
              ⌄
            </span>
          </div>
        </div>

        {/* =================================================
            BRANDS
        ================================================= */}

        {allBrands.length > 0 && (
          <div className={styles.filterSection}>

            <div className={styles.brandHeading}>
              <h3>Brand</h3>
            </div>

            <div className={styles.brandList}>

              {visibleBrands.map(
                ({
                  category,
                  brand,
                  count,
                }) => {
                  const active =
                    selectedFilterBrand?.category ===
                      category &&
                    selectedFilterBrand?.brand ===
                      brand;

                  return (
                    <button
                      key={`${category}-${brand}`}
                      type="button"
                      className={`${styles.brandButton} ${
                        active
                          ? styles.activeBrand
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedFilterBrand(
                          active
                            ? null
                            : {
                                category,
                                brand,
                              }
                        );
                      }}
                    >
                      <span>
                        {brand}
                      </span>

                      <span
                        className={
                          styles.brandCount
                        }
                      >
                        {count}
                      </span>
                    </button>
                  );
                }
              )}

            </div>

            {allBrands.length > 6 && (
              <button
                type="button"
                className={
                  styles.viewMore
                }
                onClick={() =>
                  setShowAllBrands(
                    !showAllBrands
                  )
                }
              >
                {showAllBrands
                  ? "Show Less"
                  : `View All Brands (${allBrands.length})`}
              </button>
            )}
          </div>
        )}

        {/* =================================================
            ACTIONS
        ================================================= */}

        <div className={styles.actions}>

          <button
            type="button"
            className={styles.applyButton}
            onClick={onApplyFilters}
          >
            Apply Filters
          </button>

          <button
            type="button"
            className={styles.clearButton}
            onClick={handleReset}
          >
            Clear Filters
          </button>

        </div>

      </div>
    </aside>
  );
};

export default Filters;