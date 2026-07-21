"use client";

import React, { useEffect, useState } from "react";
import styles from "./Index.module.scss";

interface OffersSliderProps {
  onCityChange: (city: string, isManual?: boolean) => void;
}

const OffersSlider: React.FC<OffersSliderProps> = ({ onCityChange }) => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCityModal, setShowCityModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string>("Select Your Cities");
  const [cities, setCities] = useState<string[]>([]);
  const [searchCityTerm, setSearchCityTerm] = useState<string>("");

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(searchCityTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/Search");
        const json = await res.json();

        if (json.success) {
          const products = json.data || [];
          setAllProducts(products);

          const cityNames = products
            .map((product) => product.location?.city)
            .filter(Boolean) as string[];

          const uniqueCities = Array.from(new Set(cityNames)).sort();
          setCities(["All Cities", ...uniqueCities]);

          const savedCity = localStorage.getItem("selectedCity");

          if (savedCity) {
            setSelectedCity(savedCity);
            onCityChange(savedCity, false);
            setFilteredProducts(
              savedCity === "All Cities"
                ? products
                : products.filter((p) => p.location?.city === savedCity)
            );
          } else {
            detectNearestCity(); // ✅ now clean call
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const detectNearestCity = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const res = await fetch("/api/get-nearest-area", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          const data = await res.json();

          const finalCity = data.city || "All Cities";

          setSelectedCity(finalCity);
          localStorage.setItem("selectedCity", finalCity);

          // ✅ Close modal when live location is selected
          setShowCityModal(false);

          // ✅ Redirect same as manual city selection
          onCityChange(finalCity, true);

          setFilteredProducts(
            finalCity === "All Cities"
              ? allProducts
              : allProducts.filter((p) => p.location?.city === finalCity)
          );
        } catch (err) {
          console.error("Error fetching nearest area:", err);
          setSelectedCity("All Cities");
          setFilteredProducts(allProducts);
          setShowCityModal(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setSelectedCity("All Cities");
        setFilteredProducts(allProducts);
        setShowCityModal(false);
      }
    );
  };

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityModal(false);
    localStorage.setItem("selectedCity", city);
    onCityChange(city, true);

    setFilteredProducts(
      city === "All Cities"
        ? allProducts
        : allProducts.filter((p) => p.location?.city === city)
    );
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.citySelector}>
        <button aria-label="Selected City" className={styles.cityButton} onClick={() => setShowCityModal(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z"
              fill="currentColor"
            />
          </svg>
          <span>{selectedCity}</span>
        </button>
      </div>

      {showCityModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCityModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Select Your City</h3>

            {/* ✅ Live Location Button now triggers API call */}
            

            <div className={styles.searchSticky}>
              <div className={styles.searchInputWrapper}>
                <span className="icon-search" />
                <input
                  type="text"
                  placeholder="Search city..."
                  value={searchCityTerm}
                  onChange={(e) => setSearchCityTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button aria-label="Live Location" onClick={detectNearestCity} className={styles.liveLocation}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="25"
                height="25"
                fill="currentColor"
                viewBox="0 0 24 24"
                style={{ marginRight: "6px" }}
              >
                <path d="M12 2a1 1 0 0 1 1 1v1.07A7.002 7.002 0 0 1 19.93 11H21a1 1 0 1 1 0 2h-1.07A7.002 7.002 0 0 1 13 19.93V21a1 1 0 1 1-2 0v-1.07A7.002 7.002 0 0 1 4.07 13H3a1 1 0 1 1 0-2h1.07A7.002 7.002 0 0 1 11 4.07V3a1 1 0 0 1 1-1zm0 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
              </svg>
              Use My Location
            </button>
            </div>

            <div className={styles.cityList}>
              {filteredCities.map((city) => (
                <button
                  aria-label="city"
                  key={city}
                  className={`${styles.cityOption} ${
                    selectedCity === city ? styles.selected : ""
                  }`}
                  onClick={() => handleCityChange(city)}
                >
                  {city}
                </button>
              ))}
            </div>

            <button className={styles.closeButton} onClick={() => setShowCityModal(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OffersSlider;
