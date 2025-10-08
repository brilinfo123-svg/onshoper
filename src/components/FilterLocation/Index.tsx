"use client";

import React, { useEffect, useState } from "react";
import styles from "./index.module.scss";

interface OffersSliderProps {
  onCityChange: (city: string, isManual?: boolean) => void;
}

const OffersSlider: React.FC<OffersSliderProps> = ({ onCityChange }) => {
  const [allProducts, setAllProducts] = useState<any[]>([]);
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
            onCityChange(savedCity, false); // ✅ no redirect
          } else {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;

                let closestCity = "";
                let minDistance = Infinity;

                products.forEach((product) => {
                  const prodLat = product.location?.coordinates?.lat;
                  const prodLng = product.location?.coordinates?.lng;

                  if (prodLat && prodLng) {
                    const distance = getDistance(latitude, longitude, prodLat, prodLng);
                    if (distance < minDistance) {
                      minDistance = distance;
                      closestCity = product.location?.city;
                    }
                  }
                });

                const finalCity = closestCity && uniqueCities.includes(closestCity)
                  ? closestCity
                  : "All Cities";

                setSelectedCity(finalCity);
                localStorage.setItem("selectedCity", finalCity);
                onCityChange(finalCity, false); // ✅ no redirect
              },
              () => {
                setSelectedCity("All Cities");
                localStorage.setItem("selectedCity", "All Cities");
                onCityChange("All Cities", false); // ✅ no redirect
              }
            );
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

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityModal(false);
    localStorage.setItem("selectedCity", city);
    onCityChange(city, true); // ✅ manual selection triggers redirect
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.citySelector}>
        <button className={styles.cityButton} onClick={() => setShowCityModal(true)}>
        <svg width="20" height="20"
            viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M12 8C9.79 8 8 9.79 8 12C8 14.21 9.79 16 12 16C14.21 16 16 14.21 16 12C16 9.79 14.21 8 12 8ZM20.94 11C20.48 6.83 17.17 3.52 13 3.06V1H11V3.06C6.83 3.52 3.52 6.83 3.06 11H1V13H3.06C3.52 17.17 6.83 20.48 11 20.94V23H13V20.94C17.17 20.48 20.48 17.17 20.94 13H23V11H20.94ZM12 19C8.13 19 5 15.87 5 12C5 8.13 8.13 5 12 5C15.87 5 19 8.13 19 12C19 15.87 15.87 19 12 19Z"
              fill="currentColor"
            />
          </svg>
          {selectedCity}
        </button>
      </div>

      {showCityModal && (
        <div className={styles.modalOverlay} onClick={() => setShowCityModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3>Select Your City</h3>
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
            </div>

            <div className={styles.cityList}>
              {filteredCities.map((city) => (
                <button
                  key={city}
                  className={`${styles.cityOption} ${selectedCity === city ? styles.selected : ""}`}
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
