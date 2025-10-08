"use client";

import React from "react";
import styles from "./Index.module.scss";

const FilterControls = ({
  isVisible,
  minPrice,
  maxPrice,
  filterType,
  setMinPrice,
  setMaxPrice,
  setFilterType,
  onClose,
  onApplyFilters
}) => {
  return (
    <>
      <div className={`${styles.overlay} ${isVisible ? styles.show : ""}`} onClick={onClose}></div>

<div className={`${styles.filterControlsDrawer} ${isVisible ? styles.slideUp : styles.slideDown}`}>
        <h3 className={styles.title}>Filter Products</h3>

        <div className={styles.priceFilter}>
          <div className={styles.priceInput}>
            <label htmlFor="minPrice" className="icon-rupee">From</label>
            <input
              id="minPrice"
              type="number"
              placeholder="Min Price"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
          <div className={styles.priceInput}>
            <label htmlFor="maxPrice" className="icon-rupee">To</label>
            <input
              id="maxPrice"
              type="number"
              placeholder="Max Price"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : "")}
            />
          </div>
        </div>

        <div className={styles.applyBtn}>
          <button onClick={() => {
            onApplyFilters();
            onClose(); // ✅ close drawer
          }}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterControls;
