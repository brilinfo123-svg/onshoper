"use client";
import React, { useEffect, useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import { useRouter } from "next/navigation";
import useMediaQuery from "../../../hooks/useMediaQuery";
import Image from "next/image";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface Suggestion {
  subcategory: string;
  coverImage: string;
  _id: string;
  title?: string;
  brand?: string;
  model?: string;
  MobileBrand?: string;
  MobileModel?: string;
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

const Banner: React.FC<Props> = ({ bannerClass, contentClass }) => {
  const router = useRouter();
  const isMobile = useMediaQuery("(max-width: 992px)");

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholders = [
    "Search Mobile Phones...",
    "Search Cars...",
    "Search Bikes...",
    "Search Electronics...",
    "Search Jobs...",
    "Search Services...",
    "Search Properties...",
  ];

  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  useEffect(() => {
    if (!debouncedSearchTerm.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(debouncedSearchTerm)}`
        );
        const data = await res.json();
        setSuggestions(data?.data || []);
      } catch (err) {
        console.error("Search suggestion error", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchTerm]);

  const handleSearch = (value?: string) => {
    const query = value || searchTerm;
    if (!query.trim()) return;

    setSuggestions([]);
    router.push(`/filter?searchTerm=${encodeURIComponent(query)}`);
  };

  return (
    <div className={`${Style.banner} ${bannerClass} ${Style.stickyBanner}`}>
      <div className={`${Style.content} ${contentClass}`}>
        <div className={Style.searchSection}>
          <div className={Style.searchBox}>
            <input
              type="text"
              className={Style.searchInput}
              placeholder={placeholders[placeholderIndex]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />

            {/* Suggestions Dropdown */}
            {searchTerm && suggestions.length > 0 && (
              <div className={Style.suggestionsDropdown}>
                {suggestions.map((item) => {
                  // ⭐ Title for UI
                  const label = item.title || "";

                  // ⭐ Subcategory for search + UI
                  const subLabel = item.subcategory || "";

                  return (
                    <div
                      key={item._id}
                      className={Style.suggestionItem}
                      onClick={() => handleSearch(subLabel || label)} // ⭐ send subcategory to filter page
                    >
                      <div className={Style.suggestionContent}>
                        {/* Image */}
                        <Image
                          src={item.coverImage || "/images/DefoultImage.jpg"}
                          alt={label}
                          width={40}
                          height={40}
                          className={Style.suggestionImage}
                          placeholder="blur"
                          blurDataURL="/images/placeholder.png"
                        />

                        {/* Text container */}
                        <div className={Style.suggestionText}>
                          <span className={Style.mainLabel}>{label}</span>

                          {subLabel && (
                            <span className={Style.subLabel}>{subLabel}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className={Style.suggestionsDropdown}>
                <div className={Style.loading}>Searching...</div>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              className={Style.searchButton}
              onClick={() => handleSearch()}
            >
              <span className="icon-search-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;
