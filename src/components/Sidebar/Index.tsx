"use client";

import React, { useState, useEffect } from "react";
import styles from "./Index.module.scss";
import Image from "next/image";

interface Product {
  _id: string;
  title: string;
  category: string;
  subcategory?: string;
  [key: string]: any;
}

interface SidebarProps {
  products: Product[];
  selectedCategories: string[];
  selectedSubcategories: string[];
  onCategoryChange: (categoryId: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
}

const Sidebar = ({
  products,
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Check if device is mobile or tablet
  useEffect(() => {
    const checkDevice = () => {
      const isMobile = window.innerWidth <= 768;
      const isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
      setIsMobileOrTablet(isMobile || isTablet);
    };

    // Initial check
    checkDevice();

    // Add event listener for resize
    window.addEventListener("resize", checkDevice);

    // Cleanup
    return () => window.removeEventListener("resize", checkDevice);
  }, []);

  // Map category names to icon classes
  const categoryIcons: Record<string, string> = {
    "Real Estate": "/icons/residential.png",
    "Services": "/icons/customer-service.png",
    "Commercial Vehicles": "/icons/truck.png",
    "Vehicles": "/icons/motor-sports.png",
    "Mobiles": "/icons/mobile-app.png",
    "Events & Entertainment": "/icons/banner.png",
    "Education & Learning": "/icons/light-bulb.png",
    "Tools & Equipment": "/icons/settings.png",
    "Pets & Pet Care": "/icons/pets.png",
    "Jobs": "/icons/businessman.png",
    "Books, Sports & Hobbies": "/icons/referee.png",
    "Fashion": "/icons/dress.png",
    "Furniture": "/icons/furnitures.png",
    "Electronics & Appliances": "/icons/device.png",
    "Car": "/icons/car.png",
    "Spare Parts": "/icons/spare-parts.svg"
  };

  // Group products by category → subcategories
  const groupedData = products.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = new Set();
    }
    if (product.subcategory) {
      acc[product.category].add(product.subcategory);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  // Filter categories by search term
  const filteredCategories = Object.keys(groupedData)
    .map((category) => ({
      id: category,
      name: category,
      subcategories: Array.from(groupedData[category]),
    }))
    .filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some((sub) =>
        sub.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

  const toggleSidebar = () => setSidebarVisible((prev) => !prev);

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategory((prev) => (prev === categoryId ? null : categoryId));
  };

  // Don't render if on mobile or tablet
  if (isMobileOrTablet) {
    return null;
  }

  return (
    <div className={styles.sidebarWrapper}>
      {/* Toggle button for mobile */}
      <button
        className={`${styles.toggleButton} ${
          isSidebarVisible ? styles.hideOnDesktop : ""
        }`}
        onClick={toggleSidebar}
      >
        {isSidebarVisible ? "Close Filters" : "Filter by Categories"}
        <span className="icon-sliders"></span>
      </button>

      {/* Sidebar content */}
      <aside className={`${styles.sidebar} ${isSidebarVisible ? styles.visibleOnMobile : styles.hiddenOnMobile}`}>
        <h2>Filter by Search</h2>

        {/* Search bar */}
        <input
          type="text"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />

        {/* Category list */}
        <ul>
          {filteredCategories.map((category) => (
            <li key={category.id}>
              {/* Category header with toggle */}
              <div className={styles.categoryHeader} onClick={() => handleCategoryClick(category.id)} style={{cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",}}>
                <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  {/* Category icon */}
                  {categoryIcons[category.name] && (
                      <Image
                        src={categoryIcons[category.name]}
                        alt={category.name}
                        width={24}
                        height={24}
                    />
                    )}

                  <span>{category.name}</span>
                </label>

                {/* Arrow toggle */}
                <span>
                  {openCategory === category.id ? (
                    <span className="icon-up-open-big"></span>
                  ) : (
                    <span className="icon-down-open-big"></span>
                  )}
                </span>
              </div>

              {/* Subcategory dropdown with smooth animation */}
              <div className={styles.dropdownWrapper} style={{maxHeight:
                    openCategory === category.id
                      ? `${category.subcategories.length * 40}px`
                      : "0px", overflow: "hidden", transition: "max-height 0.4s ease",
                }}>
                {category.subcategories.length > 0 && (
                  <ul className={styles.subcategoryList}>
                    {category.subcategories.map((sub) => (
                      <li key={sub}>
                        <label>
                          <input
                            type="checkbox"
                            value={sub}
                            checked={selectedSubcategories.includes(sub)}
                            onChange={() => onSubcategoryChange(sub)}
                          />
                          {sub}
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}

          {filteredCategories.length === 0 && (
            <p className={styles.noResults}>No categories found</p>
          )}
        </ul>
      </aside>
    </div>
  );
};

export default Sidebar;