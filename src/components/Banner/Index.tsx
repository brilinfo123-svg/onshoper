"use client";
import React, { useEffect, useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import useMediaQuery from "../../../hooks/useMediaQuery";

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

const Banner: React.FC<Props> = ({ bannerClass, searchTitle, contentClass}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredSuggestions, setFilteredSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const isDesckTop = useMediaQuery("(max-width: 992px)");

  const router = useRouter();

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Filter suggestions
  useEffect(() => {
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
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
  }, [searchTerm, products]);

  const handleSearch = (term?: string) => {
    const query = term || searchTerm;
    if (!query) return;
    const queryString = new URLSearchParams({ searchTerm: query }).toString();
    router.push(`/filter?${queryString}`);
  };

  return (
    <div className={`${Style.banner} ${bannerClass}`}>
      <div className={`${Style.content} ${contentClass}`}>
        {/* <div className={Style.bannerContent}>
          <h1 className={Style.heading}>{searchTitle}</h1>
          <p className={Style.text}>{searchDesc}</p>
        </div> */}

        <div className={Style.searchSection}>
          <div className={Style.searchBox}>
            <input
              type="text"
              placeholder="Search by category..."
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
                  // choose the best available value
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
                      
                        // ✅ Step 1: Update input box
                        setSearchTerm(finalValue);
                      
                        // ✅ Step 2: Clear suggestions AFTER input update
                        setTimeout(() => {
                          setFilteredSuggestions([]);
                        }, 0); // micro-delay ensures re-render
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

          {!isDesckTop && <button className={Style.searchButton} onClick={() => handleSearch()}>
            <span role="img" aria-label="Search" className="icon-search-1"></span>
          </button>}
        </div>

        {/* <div className={`${Style.bannerContent} ${Style.bannerContentLink}`}>
          <Link href="/watch">
            <span className="icon-map-signs"></span> Search For Rent
          </Link>
          <Link href="/category">
            <span className="icon-shop"></span> Search For Buy
          </Link>
        </div> */}
      </div>

      {/* <div className={Style.imgWrap1}>
        <Image src={"/images/vendor.png"} width={262} height={262} alt="Vendors" />
      </div>
      <div className={Style.imgWrap2}>
        <Image src={"/images/Vendor2.png"} width={262} height={262} alt="Vendors" />
      </div> */}

      {/* {loading && <div>Loading products...</div>} */}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default Banner;
