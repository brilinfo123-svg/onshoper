"use client";

import React, { useEffect, useRef, useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import { useRouter, usePathname } from "next/navigation";
import useMediaQuery from "../../../hooks/useMediaQuery";
import Image from "next/image";
import { useSearch } from "@/contexts/SearchContext";

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
  bannerClass?: string;
  searchTitle?: string;
  contentClass?: string;
}

const placeholders = [
  "Search Mobile Phones...",
  "Search Cars...",
  "Search Bikes...",
  "Search Electronics...",
  "Search Jobs...",
  "Search Services...",
  "Search Properties...",
];

const Banner: React.FC<Props> = ({ bannerClass, contentClass }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 992px)");
  const searchBoxRef = useRef<HTMLDivElement>(null);

  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const { searchTerm, setSearchTerm } = useSearch();
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Reset search state on route change
  useEffect(() => {
    if (pathname !== "/filter") {
      setSearchTerm("");
    }
    setSuggestions([]);
    setShowSuggestions(false);
    setIsInputFocused(false);
  }, [pathname, setSearchTerm]);

  // Reset on page show
  useEffect(() => {
    const handlePageShow = () => {
      setShowSuggestions(false);
      setIsInputFocused(false);
      setSuggestions([]);
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchBoxRef.current &&
        !searchBoxRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    if (debouncedSearchTerm.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search-suggestions?q=${encodeURIComponent(debouncedSearchTerm)}`,
          { signal: controller.signal }
        );
        const data = await res.json();
        setSuggestions(data?.data || []);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Search suggestion error", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
    return () => controller.abort();
  }, [debouncedSearchTerm]);

  const handleSearch = (value?: string) => {
    const query = value || searchTerm;
    if (!query.trim()) return;

    setSearchTerm(query);
    setSuggestions([]);
    router.push(`/filter?searchTerm=${encodeURIComponent(query)}`);
  };

  return (
    <div className={`${Style.banner} ${bannerClass} ${Style.stickyBanner}`}>
      <div className={`${Style.content} ${contentClass}`}>
        <div className={Style.searchSection}>
          <div className={Style.searchBox} ref={searchBoxRef}>
            <input
              type="text"
              className={Style.searchInput}
              placeholder={placeholders[placeholderIndex]}
              value={searchTerm}
              onFocus={() => {
                setIsInputFocused(true);
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              onBlur={() => {
                setTimeout(() => {
                  setIsInputFocused(false);
                  setShowSuggestions(false);
                }, 150);
              }}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowSuggestions(false);
                  setIsInputFocused(false);
                  handleSearch();
                }
              }}
            />

            {/* Suggestions Dropdown */}
            {isInputFocused &&
              showSuggestions &&
              searchTerm &&
              suggestions.length > 0 && (
                <div className={Style.suggestionsDropdown}>
                  {suggestions.map((item) => {
                    const label = item.title || "";
                    const subLabel = item.subcategory || "";

                    return (
                      <div
                        key={item._id}
                        className={Style.suggestionItem}
                        onClick={() => {
                          const value = subLabel || label;
                          setSearchTerm(value);
                          setSuggestions([]);
                          setShowSuggestions(false);
                          setIsInputFocused(false);
                          handleSearch(value);
                        }}
                      >
                        <div className={Style.suggestionContent}>
                          <Image
                            src={item.coverImage || "/images/DefoultImage.jpg"}
                            alt={label}
                            width={40}
                            height={40}
                            className={Style.suggestionImage}
                          />
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
            {isInputFocused && showSuggestions && loading && (
              <div className={Style.suggestionsDropdown}>
                <div className={Style.loading}>Searching...</div>
              </div>
            )}
          </div>

          {!isMobile && (
            <button
              aria-label="Search"
              className={Style.searchButton}
              onClick={() => {
                setShowSuggestions(false);
                setIsInputFocused(false);
                handleSearch();
              }}
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
