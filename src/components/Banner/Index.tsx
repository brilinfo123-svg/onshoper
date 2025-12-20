"use client";
import React, { useEffect, useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import { useRouter } from "next/navigation";
import useMediaQuery from "../../../hooks/useMediaQuery";

// ✅ Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

interface Suggestion {
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

  // 🔁 Rotating placeholders
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
    }, 2500); // 👈 smoother
    return () => clearInterval(interval);
  }, []);

  // ✅ Debounced value
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // 🚀 Fetch search suggestions (API based)
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

  // 🔍 Handle final search
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

            {/* ✅ Suggestions Dropdown */}
            {searchTerm && suggestions.length > 0 && (
              <div className={Style.suggestionsDropdown}>
                {suggestions.map((item) => {
                  const label =
                    item.MobileModel ||
                    item.model ||
                    item.brand ||
                    item.MobileBrand ||
                    item.carBrand ||
                    item.carModel ||
                    item.commercialBrand ||
                    item.commercialModel ||
                    item.title;

                  return (
                    <div
                      key={item._id}
                      className={Style.suggestionItem}
                      onClick={() => handleSearch(label)}
                    >
                      {label}
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
