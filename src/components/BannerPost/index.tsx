import React from "react";
import styles from "./banner.module.scss";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// import Image from "next/image";
// import Slider from "react-slick";
// import Link from "next/link";
// import SearchBar from "../searchBar";

const banner = () => {
  return (
    <div className="grayBg">
      <div className="container">
        <div className={styles.banner}>
          <div className={styles.content}>
            <p className={styles.activeAds}>Over 10,56,432 Active Ads</p>
            <h1 className={styles.title}>
              Buy, Sell, Rent & Exchange In One Click
            </h1>
            <p className={styles.search}>
              <span className={styles.popularSearch}>Popular Search:</span>
              Real Estate &nbsp; Mobile Phones &nbsp; Electronics &nbsp;
              Vehicles &nbsp; Cars &nbsp; Jobs &nbsp; etc
            </p>
          </div>
          <div className={styles.adTag}>Advertisement</div>
        </div>
      </div>
    </div>
  );
};

export default banner;
