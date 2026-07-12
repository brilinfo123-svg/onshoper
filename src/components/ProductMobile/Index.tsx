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
  const [hideIcons, setHideIcons] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsSticky(true);   // ✅ scroll down → add sticky class
      } else {
        setIsSticky(false);  // ✅ scroll top → remove sticky class
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    align: "start",
    slidesToScroll: 4,
    dragFree: true,
  }, []);

  useEffect(() => {
    if (products && products.length > 0 && !fetchedRef.current) {
      setIsLoading(false);
      fetchedRef.current = true; // ✅ mark as loaded once
    }
  }, [products]);
  

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Map category names to icon paths
  const categoryIcons: Record<string, string> = {
    "Real Estate": "/icons/building-town.svg",
    "Services": "/icons/customer-service.svg",
    "Commercial Vehicles": "/icons/bus-passanger.svg",
    "Bikes": "/icons/motorcycles.svg",
    "Bicycles": "/icons/bike-Svg.svg",
    "Mobiles": "/icons/mobile-phone-electronics.svg",
    "Events & Entertainment": "/icons/wedding-arch.svg",
    "Education & Learning": "/icons/student.svg",
    "Tools & Equipment": "/icons/hammer-and-wrench.svg",
    "Pets & Pet Care": "/icons/dog-face.svg",
    "Jobs": "/icons/work-job.svg",
    "Books & Sports": "/icons/books.svg",
    "Fashion": "/icons/pyjamas-suit.svg",
    "Furniture": "/icons/furnitures.png",
    "Electronics": "/icons/computer-tv.svg",
    "Car": "/icons/car.png",
    "Spare Parts": "/icons/spare-parts.svg",
    "Default": "/icons/category.png"
  };

  // Map subcategory names to icon paths
  const subcategoryIcons: Record<string, string> = {
    // Real Estate subcategories
    "House & Apartments": "/icons/aparment-house.svg",
    "Shops & Offices": "/icons/ShopOffice.svg",
    "Land & Plots": "/icons/geo-fence.svg",
    "Commercial Properties": "/icons/building-tows.svg",
    "PG & Guest House": "/icons/house.png",

    // Vehicles subcategories
    "Cars": "/icons/car-angled.svg",
    "Motorcycles": "/icons/motorcycle-svg.svg",
    "Spare Parts": "/icons/wheel-svg.svg",
    "Scooters": "/icons/motor-scooter-svg.svg",
    "Bicycles": "/icons/bike-Svg.svg",

    // Mobiles subcategories
    "Mobile Phones": "/icons/mobile-phone-electronics.svg",
    "Tablets": "/icons/ipad-svg.svg",
    "Accessories": "/icons/Mobile-cable.svg",
    "Other Device": "/icons/sketch-book.png",

    // Tools & Equipment
    "Cleaning Tools": "/icons/cleaning-mop.svg",
    "Power Tools": "/icons/drill-drill.svg",
    "Construction Tools": "/icons/building-construction.svg",
    "Medical Equipment": "/icons/medical-kit.svg",
    "Farming Tools": "/icons/tractor-s.svg",
    "Other Tools": "/icons/file-document.svg",

    // Services
    "Legal & Documentation": "/icons/archive-document.svg",
    "Photography": "/icons/photo-camera.svg",
    "Tutors & Classes": "/icons/classTeacher.svg",
    "Health & Wellness": "/icons/healthCare.svg",
    "Packers & Movers": "/icons/delivery-mans.svg",
    "Event Services": "/icons/wedding-arch.svg",
    "Home Services": "/icons/home-Services.svg",
    "Repair": "/icons/engineer-worker.svg",
    

    // Electronics subcategories
    "TV & Video": "/icons/television.png",
    "Computers & Laptops": "/icons/computer.svg",
    "Home Appliances": "/icons/electric-appliance.png",
    "ACs & Coolers": "/icons/cooling.svg",
    "Kitchen Appliances": "/icons/kitchenCabinet.png",
    "Cameras & Accessories": "/icons/photo-camera.svg",
    "Gaming Consoles": "/icons/gameController.png",
    "Smart Home Devices": "/icons/domotics.png",
    "Power Banks & Chargers": "/icons/powerBank.png",
    "Projectors": "/icons/projector.png",
    "Monitors & Accessories": "/icons/dataAnalysis.png",
    "Printers & Scanners": "/icons/printer-print.svg",
    "Water Purifiers": "/icons/tank.svg",
    "Heaters & Geysers": "/icons/showers-water.svg",
    "Audio & Music Systems": "/icons/music-player-audio.svg",
    "Washing Machines": "/icons/washing-machine.svg",
    "Other Electronics": "/icons/file-document.svg",

     // Books & Sports
     "Gym & Fitness": "/icons/dumbbell.svg",
     "Books": "/icons/books.svg",
     "Musical Instruments": "/icons/guitar.svg",
     "Sports Equipment": "/icons/sports-mode.svg",
     "Collectibles": "/icons/collect.svg",
     "Board Games": "/icons/chess.svg",
     "Toys": "/icons/teddy-bear.svg",
     


    // Feshion subcategories
    "Ethnic Wear": "/icons/sari.png",
    "Eyewear": "/icons/sunglassessvg.svg",
    "Footwear": "/icons/footwear-shoe.svg",
    "Women’s Clothing": "/icons/clothing-summer.svg",
    "Men’s Clothing": "/icons/necktie-svg.svg",
    "Kids": "/icons/body-baby-clothes.svg",

    // Education & Learning
    "Skill Courses": "/icons/student.svg",
    "Competitive Exam Material": "/icons/medal-gold-winner.svg",
    "Tuition": "/icons/teacher.svg",
    "Coaching Classes": "/icons/statistics-teacher.svg",

    // Commercial Vehicles
    "Tractors": "/icons/tractor.svg",
    "Mini Trucks": "/icons/truck-mini.svg",
    "Auto Rickshaws": "/icons/auto-rickshaw.svg",
    "E-Rickshaws": "/icons/transport.png",
    "Pickups": "/icons/car-picups.svg",
    "Passenger Buses": "/icons/bus-passanger.svg",
    "Construction Vehicles": "/icons/trucking-construction.svg",
    "Delivery Vans": "/icons/delivery-truck-deliver.svg",

     // Jobs
     "Office Jobs": "/icons/worker.png",
     "Delivery Jobs": "/icons/delivery-man.png",
     "Driver Jobs": "/icons/taxi-driver.svg",
     "Freelancers": "/icons/freelancer.svg",
     "Work from Home": "/icons/man-doing-remote.svg",
     "Internships": "/icons/man-office-worker.svg",
     "Part-time": "/icons/Part_time.svg",
     "Full-time": "/icons/time-twenty-four.svg",
     "Other Jobs": "/icons/file-document.svg",
    

    // Furniture
    "Sofas & Dining": "/icons/sofa-Dinings.svg",
    "Beds & Wardrobes": "/icons/bed-svg.svg",
    "Tables & Chairs": "/icons/dining-room.svg",
    // "Home Decor & Garden": "/icons/shelf.png",
    "Mattresses": "/icons/mat.png",
    "Office Furniture": "/icons/office-studio.svg",
    "Other Household Items": "/icons/furniture-and-household.svg",

    // Pets & Pet Care
    "Cats": "/icons/cat-face.svg",
    "Dogs": "/icons/dog-face.svg",
    "Birds": "/icons/birds.svg",
    "Fish & Aquariums": "/icons/fish.svg",
    "Pet Care Services": "/icons/care-day-health.svg",
    "Other Pets": "/icons/file-document.svg",

    // Events & Entertainment

    "Party Supplies": "/icons/notebook-wedding.svg",
    "Costumes": "/icons/bride-dress-wedding.svg",
    "DJ & Sound Systems": "/icons/sound-system.svg",
    "Lighting Equipment": "/icons/disco-ball-disc.svg",
    "Stage Setup": "/icons/stage.svg",

    // Others
     "Other Books & Sports": "/icons/file-document.svg",
     "Other Events": "/icons/file-document.svg",
     "Other Services": "/icons/file-document.svg",
     "Other Properties": "/icons/file-document.svg",
     "Other Fashion": "/icons/file-document.svg",
     "Other Commercial Vehicles": "/icons/file-document.svg",

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

 

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) { // ✅ threshold adjust karo
        setHideIcons(true);
      } else {
        setHideIcons(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  

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
            <button className={`${styles.carouselControl} ${styles.leftArrow} ${"icon-left-open-big"}`} onClick={scrollPrev}></button>
            <div className={`${styles.embla}`}>
            {/* <div className={`${styles.embla} ${isSticky ? styles.isSticky : ""}`}> */}
              <div className={styles.embla__viewport} ref={emblaRef}>
                <div className={styles.embla__container}>
                  {filteredCategories.map((category) => (
                    <div key={category.id} className={styles.embla__slide} onClick={() => handleCategoryClick(category.id)}>
                       <div className={`${styles.carouselIcon}`}>
                       {/* <div className={`${styles.carouselIcon} ${hideIcons ? styles.fadeOut : styles.fadeIn}`}> */}
                        <Image src={getCategoryIcon(category.name)} alt={category.name} width={30} height={30}/>
                      </div>
                      <span className={styles.carouselName}>{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button className={`${styles.carouselControl} ${styles.rightArrow} ${"icon-right-open-big"}`} onClick={scrollNext} disabled={!emblaApi || !emblaApi.canScrollNext()}></button>
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
          <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles.searchInput}/>
          {searchTerm && (
            <button className={`${styles.clearSearch} ${"icon-cancel-squared"}`} onClick={() => setSearchTerm("")}>
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
                <div className={`${styles.categoryHeader} ${openCategory === category.id ? styles.active : ''}`} onClick={() => handleCategoryClick(category.id)}>
                  <div className={styles.categoryInfo}>
                    <Image src={getCategoryIcon(category.name)} alt={category.name} width={28} height={28} className={styles.categoryIcon}/>
                    <span className={styles.categoryName}>{category.name}</span>
                  </div>

                  <button className={styles.expandButton} onClick={(e) => { e.stopPropagation(); handleCategoryClick(category.id); }}>
                    <span className={`${openCategory === category.id ? "icon-up-open-big" : "icon-down-open-big"}`}></span>
                  </button>
                </div>

                {/* Subcategory list with animation */}
                <div className={styles.subcategoriesContainer} style={{ maxHeight: openCategory === category.id ? `${category.subcategories.length * 50}px` : "0px" }}>
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory} className={`${styles.subcategoryItem} ${selectedSubcategories.includes(subcategory) ? styles.selected : ''}`} onClick={() => handleSubcategorySelect(subcategory)}>
                      <Image src={getSubcategoryIcon(subcategory)} alt={subcategory} width={20} height={20} className={styles.subcategoryIcon}/>
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
              <button className={styles.clearAllButton} onClick={() => {selectedSubcategories.forEach(sub => onSubcategoryChange(sub));}}>Clear All</button>
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

export default React.memo(ProductMobile);