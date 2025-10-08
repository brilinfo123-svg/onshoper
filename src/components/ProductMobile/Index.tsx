"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import styles from "./Index.module.scss";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import router from "next/router";

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

const ProductMobile = ({
  products,
  selectedCategories,
  selectedSubcategories,
  onCategoryChange,
  onSubcategoryChange,
}: SidebarProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"carousel" | "sidebar">("carousel");
  const [isLoading, setIsLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    slidesToScroll: 4,
    dragFree: true,
  }, []);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Map category names to icon paths
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
    "Books & Sports": "/icons/referee.png",
    "Fashion": "/icons/dress.png",
    "Furniture": "/icons/furnitures.png",
    "Electronics & Appliances": "/icons/device.png",
    "Car": "/icons/car.png",
    "Spare Parts": "/icons/spare-parts.svg",
    "Default": "/icons/category.png"
  };

  // Map subcategory names to icon paths
  const subcategoryIcons: Record<string, string> = {
    // Real Estate subcategories
    "House & Apartments": "/icons/housing.png",
    "Shops & Offices": "/icons/store.png",
    "Land & Plots": "/icons/maps-and-location.png",
    "Commercial Properties": "/icons/building.png",
    "PG & Guest House": "/icons/house.png",

    // Vehicles subcategories
    "Cars": "/icons/car.png",
    "Motorcycles": "/icons/motor-sports.png",
    "Spare Parts": "/icons/wheel.png",
    "Scooters": "/icons/scooter.png",
    "Bicycles": "/icons/bicycle.png",

    // Mobiles subcategories
    "Mobile Phones": "/icons/phone.png",
    "Tablets": "/icons/tablet.png",
    "Accessories": "/icons/adapter.png",

    // Electronics subcategories
    "TV & Video": "/icons/television.png",
    "Computers & Laptops": "/icons/computer.png",
    "Home Appliances": "/icons/electric-appliance.png",
    "ACs & Coolers": "/icons/outdoor-unit.png",
    "Kitchen Appliances": "/icons/kitchenCabinet.png",
    "Cameras & Accessories": "/icons/camera.png",
    "Gaming Consoles": "/icons/gameController.png",
    "Smart Home Devices": "/icons/domotics.png",
    "Power Banks & Chargers": "/icons/powerBank.png",
    "Projectors": "/icons/projector.png",
    "Monitors & Accessories": "/icons/dataAnalysis.png",
    "Printers & Scanners": "/icons/printer.png",
    "Water Purifiers": "/icons/waterPurifier.png",
    "Heaters & Geysers": "/icons/heater.png",
    "Audio & Music Systems": "/icons/headphones.png",
    "Washing Machines": "/icons/laundryMachine.png",
    "Other Electronics": "/icons/electric-appliance.png",

    

    // Furniture subcategories
    "Sofas & Dining": "/icons/sofa.png",
    "Beds & Wardrobes": "/icons/bed.png",
    "Tables & Chairs": "/icons/chair.png",
    "Home Decor & Garden": "/icons/shelf.png",
    "Office Furniture": "/icons/workspace.png",
    "Other Household Items": "/icons/electric-appliance.png",

    // Default subcategory icon
    "Default": "/icons/subcategory.png"
  };

  // Function to get subcategory icon
  const getSubcategoryIcon = (subcategoryName: string): string => {
    return subcategoryIcons[subcategoryName] || subcategoryIcons["Default"];
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

  const toggleSidebar = () => {
    setSidebarVisible((prev) => !prev);
    if (!isSidebarVisible) {
      setViewMode("sidebar");
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    if (viewMode === "carousel") {
      // ONLY open sidebar, DON'T change view mode
      setOpenCategory(categoryId);
      setSidebarVisible(true);
    } else {
      // Toggle category in sidebar mode
      if (openCategory === categoryId) {
        setOpenCategory(null);
      } else {
        setOpenCategory(categoryId);
      }
    }
  };

  const handleSubcategorySelect = (subcategory: string) => {
    const updatedSubcategories = selectedSubcategories.includes(subcategory)
      ? selectedSubcategories.filter((s) => s !== subcategory)
      : [...selectedSubcategories, subcategory];
  
    onSubcategoryChange(subcategory);
  
    const selectedCity =
      typeof window !== "undefined"
        ? localStorage.getItem("selectedCity") || "All Cities"
        : "All Cities";
  
    router.push({
      pathname: "/filter",
      query: {
        subcategories: updatedSubcategories.join(","),
        city: selectedCity,
      },
    });
  };

  const getCategoryIcon = (categoryName: string): string => {
    return categoryIcons[categoryName] || categoryIcons["Default"];
  };

  // Skeleton Loading Component
  const CarouselSkeleton = () => (
    <div className={styles.carouselContainer}>
      <div className={styles.carouselWithControls}>
        <div className={`${styles.carouselControl} ${styles.leftArrow} ${styles.skeletonControl}`}></div>

        <div className={styles.embla}>
          <div className={styles.embla__viewport}>
            <div className={styles.embla__container}>
              {[...Array(8)].map((_, index) => (
                <div key={index} className={styles.embla__slide}>
                  <div className={`${styles.carouselIcon} ${styles.skeletonIcon}`}></div>
                  <div className={`${styles.carouselName} ${styles.skeletonText}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={`${styles.carouselControl} ${styles.rightArrow} ${styles.skeletonControl}`}></div>
      </div>
    </div>
  );

  const SidebarSkeleton = () => (
    <aside className={`${styles.sidebar} ${isSidebarVisible ? styles.visible : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.skeletonTitle}></div>
        <div className={styles.skeletonCloseButton}></div>
      </div>

      <div className={styles.searchContainer}>
        <div className={styles.skeletonSearchIcon}></div>
        <div className={styles.skeletonSearchInput}></div>
      </div>

      <div className={styles.categoriesList}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className={styles.categoryItem}>
            <div className={styles.categoryHeader}>
              <div className={styles.categoryInfo}>
                <div className={`${styles.categoryIcon} ${styles.skeletonIcon}`}></div>
                <div className={`${styles.categoryName} ${styles.skeletonText}`}></div>
              </div>
              <div className={styles.skeletonExpandButton}></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );

  if (isLoading) {
    return (
      <div className={styles.sidebarWrapper}>
        <CarouselSkeleton />
        <SidebarSkeleton />
      </div>
    );
  }

  return (
    <div className={styles.sidebarWrapper}>
      {/* Carousel view (default) */}
      {viewMode === "carousel" && (
        <div className={styles.carouselContainer}>
          <div className={styles.carouselWithControls}>
            <button 
              className={`${styles.carouselControl} ${styles.leftArrow} ${"icon-left-open-big"}`} 
              onClick={scrollPrev}
              disabled={!emblaApi || !emblaApi.canScrollPrev()}
            ></button>

            <div className={styles.embla}>
              <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>
                  {filteredCategories.map((category) => (
                    <div
                      key={category.id}
                      className={styles.embla__slide}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className={styles.carouselIcon}>
                        <Image
                          src={getCategoryIcon(category.name)}
                          alt={category.name}
                          width={30}
                          height={30}
                        />
                      </div>
                      <span className={styles.carouselName}>{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              className={`${styles.carouselControl} ${styles.rightArrow} ${"icon-right-open-big"}`} 
              onClick={scrollNext}
              disabled={!emblaApi || !emblaApi.canScrollNext()}
            ></button>
          </div>
        </div>
      )}

      {/* Sidebar content */}
      <aside className={`${styles.sidebar} ${isSidebarVisible ? styles.visible : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>Filter Products</h2>
          <button className={`${styles.closeButton} ${"icon-cancel"}`} onClick={toggleSidebar}>
            {/* <Image src="/icons/close.png" alt="Close" width={20} height={20} /> */}
          </button>
        </div>

        {/* Search bar */}
        <div className={styles.searchContainer}>
          <span className={`${styles.searchIcon} ${"icon-search-1"}`}></span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          {searchTerm && (
            <button
              className={`${styles.clearSearch} ${"icon-cancel-squared"}`}
              onClick={() => setSearchTerm("")}
            >
              {/* <Image src="/icons/close.png" alt="Clear" width={14} height={14} /> */}
            </button>
          )}
        </div>

        {/* Category list in sidebar */}
        <div className={styles.categoriesList}>
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category) => (
              <div key={category.id} className={styles.categoryItem}>
                {/* Category header */}
                <div
                  className={`${styles.categoryHeader} ${openCategory === category.id ? styles.active : ''}`}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  <div className={styles.categoryInfo}>
                    <Image
                      src={getCategoryIcon(category.name)}
                      alt={category.name}
                      width={28}
                      height={28}
                      className={styles.categoryIcon}
                    />
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>

                  <button className={styles.expandButton} onClick={(e) => { e.stopPropagation(); handleCategoryClick(category.id); }}>
                    <span className={`${openCategory === category.id ? "icon-up-open-big" : "icon-down-open-big"}`}></span>
                  </button>
                </div>

                {/* Subcategory list with animation */}
                <div className={styles.subcategoriesContainer} style={{ maxHeight: openCategory === category.id ? `${category.subcategories.length * 50}px` : "0px" }}>
                  {category.subcategories.map((subcategory) => (
                    <div
                      key={subcategory}
                      className={`${styles.subcategoryItem} ${selectedSubcategories.includes(subcategory) ? styles.selected : ''}`}
                      onClick={() => handleSubcategorySelect(subcategory)}
                    >
                      <Image
                        src={getSubcategoryIcon(subcategory)}
                        alt={subcategory}
                        width={20}
                        height={20}
                        className={styles.subcategoryIcon}
                      />
                      <span className={styles.subcategoryName}>{subcategory}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <Image src="/icons/not-found.png" alt="No results" width={60} height={60} />
              <p>No categories found</p>
              <button onClick={() => setSearchTerm("")}>Clear search</button>
            </div>
          )}
        </div>
 
        {/* Selected filters summary */}
        {selectedSubcategories.length > 0 && (
          <div className={styles.selectedFilters}>
            <h3>Active Filters</h3>
            <div className={styles.filterTags}>
              {selectedSubcategories.map(subcategory => (
                <span key={subcategory} className={styles.filterTag}>
                  {subcategory}
                  <button onClick={() => onSubcategoryChange(subcategory)}>
                    <Image src="/icons/close.png" alt="Remove" width={12} height={12} />
                  </button>
                </span>
              ))}
              <button
                className={styles.clearAllButton}
                onClick={() => {
                  selectedSubcategories.forEach(sub => onSubcategoryChange(sub));
                }}
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isSidebarVisible && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}
    </div>
  );
};

export default ProductMobile;