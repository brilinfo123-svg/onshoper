"use client"; // Add this directive at the top of the file

import React, { useState } from "react";
import styles from "./Index.module.scss";
import Link from "next/link";

type ProductCardProps = {
  image: string;
  shopName: string;
  shopTitle: string;
  shopDescription: string;
  location: string;
  contact: string;
  distance: string;
  isFavorite: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  shopName,
  shopTitle,
  shopDescription,
  location,
  contact,
  distance,
  isFavorite,
}) => {
  const [favorite, setFavorite] = useState(isFavorite);

  const toggleFavorite = () => {
    setFavorite(!favorite);
  };

  return (
    <div className={styles.card}>
      <img src={image} alt={shopName} className={styles.image} />
      <div className={styles.details}>
        <h2 className={styles.shopName}>{shopName}</h2>
        <p className={styles.shopDescription}>{shopDescription}</p>
        <div className={styles.importantDetail}>
          <p className={styles.location}><span className="icon-map-o"></span> {location}</p>
          <p className={styles.distance}><span className="icon-map-signs"></span> {distance}</p>
        </div>
        <div className={styles.trackLocation}>
          <Link href="/shopdetail">View Shop</Link>
          <Link href={contact}>Track Now</Link>
        </div>
        <div className={styles.favoriteIcon} onClick={toggleFavorite}>
          <span className={favorite ? styles.active : ""}>&#9829;</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
