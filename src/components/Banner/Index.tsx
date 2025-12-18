"use client";
import React, { useEffect, useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useMediaQuery from "../../../hooks/useMediaQuery";

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface Category {
  id: number;
  name: string;
}

interface Product {
  MobileModel: any;
  _id: string;
  title: string;
  category: string;
  subcategory?: string;
  price?: number;
  description?: string;
  brand?: string;
  model?: string;
  MobileBrand?: string;
  BicyclesBrand?: string;
  carBrand?: string;
  carModel?: string;
  commercialBrand?: string;
  commercialModel?: string;
}

interface Props {
  bannerClass?: any;
  searchTitle?: any;
  contentClass?: any;
}

const Banner: React.FC<Props> = ({ bannerClass, searchTitle, contentClass }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isDesckTop = useMediaQuery("(max-width: 992px)");

  const router = useRouter();

  const rotatingPlaceholders = [
    "Search Mobile Phones...",
    "Search Cars...",
    "Search Motorcycles...",
    "Search Electronics...",
    "Search Fashion...",
    "Search Cameras...",
    "Search Laptops...",
    "Search Furniture...",
    "Search Jobs...",
    "Search Real Estate...",
    "Search Services...",
    "Search Commercial Vehicles...",
    "Search Education & Learning...",
    "Search Commercial Property...",
    "Search Residential Property...",
    "Search PG & Hostels...",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [dynamicPlaceholder, setDynamicPlaceholder] = useState(rotatingPlaceholders[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % rotatingPlaceholders.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setDynamicPlaceholder(rotatingPlaceholders[placeholderIndex]);
  }, [placeholderIndex]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/Search");
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);

  // ✅ Debounce only for filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value); // instant update for input
  };

  // Filter suggestions
  useEffect(() => {
    if (debouncedSearchTerm.trim()) {
      const term = debouncedSearchTerm.toLowerCase();
      const searchWords = term.split(" ").filter(Boolean);

      const suggestions = products.filter((product) => {
        const fieldsToSearch = [
          product.title,
          product.category,
          product.subcategory,
          product.brand,
          product.model,
          product.MobileBrand,
          product.MobileModel,
          product.BicyclesBrand,
          product.carBrand,
          product.carModel,
          product.commercialBrand,
          product.commercialModel,
        ]
          .filter(Boolean)
          .map((field) => field.toLowerCase());

        return searchWords.every((word) =>
          fieldsToSearch.some((field) => field.includes(word))
        );
      });

      setFilteredSuggestions(suggestions);
    } else {
      setFilteredSuggestions([]);
    }
  }, [debouncedSearchTerm, products]);

  const handleSearch = (term?: string) => {
    const query = term || searchTerm;
    if (!query) return;

    setFilteredSuggestions([]);

    const queryString = new URLSearchParams({ searchTerm: query }).toString();
    router.push(`/filter?${queryString}`);
  };

  return (
    <div className={`${Style.banner} ${bannerClass} ${Style.stickyBanner}`}>
      <div className={`${Style.content} ${contentClass}`}>
        <div className={Style.searchSection}>
          <div className={Style.searchBox}>
            <input
              type="text"
              placeholder={dynamicPlaceholder}
              className={Style.searchInput}
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {searchTerm && filteredSuggestions.length > 0 && (
              <div className={Style.suggestionsDropdown}>
                {filteredSuggestions.map((product) => {
                  const searchValue =
                    product.MobileModel ||
                    product.brand ||
                    product.model ||
                    product.MobileBrand ||
                    product.BicyclesBrand ||
                    product.carBrand ||
                    product.carModel ||
                    product.commercialBrand ||
                    product.commercialModel ||
                    product.title;

                  return (
                    <div
                      key={product._id}
                      className={Style.suggestionItem}
                      onClick={() => {
                        const finalValue = searchValue || "";
                        setSearchTerm(finalValue);
                        setTimeout(() => {
                          setFilteredSuggestions([]);
                        }, 0);
                        handleSearch(finalValue);
                      }}
                    >
                      {searchValue}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isDesckTop && (
            <button className={Style.searchButton} onClick={() => handleSearch()}>
              <span role="img" aria-label="Search" className="icon-search-1"></span>
            </button>
          )}
        </div>
      </div>
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default Banner;
