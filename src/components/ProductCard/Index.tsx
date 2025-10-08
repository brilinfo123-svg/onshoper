"use client";

import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Index.module.scss";
import Link from "next/link";
import { useSession } from "next-auth/react";
import StarRating from "../StarRating/Index";
import PremiumBadge from "../PremiumBadge/Index";
import AverageRating from "../RatingAvrage/Index";

type ProductCardProps = {
  image: string;
  userShopId: string;
  myshopEmailID: string;
  shopName: string;
  shopDescription: string;
  location: string;
  contact: string;
  distance: string;
  toggleFavorite: () => void;
  isFavorite: boolean;
  MyShopId: string;
  latitude: number;
  longitude: number;
  allShopData: string;
  offer: string;
  isFeatured: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  image,
  userShopId,
  shopName,
  shopDescription,
  contact,
  location,
  latitude,
  longitude,
  distance,
  isFavorite,
  MyShopId,
  myshopEmailID,
  isFeatured,
  offer,
  
}) => {
  const { data: session } = useSession();
  const [favorite, setFavorite] = useState(isFavorite ?? false);
  const [loading, setLoading] = useState(false);

  // Load favorite status from localStorage on mount
  useEffect(() => {
    const storedFavorite = localStorage.getItem(`favorite-${MyShopId}-${userShopId}`);
    if (storedFavorite) setFavorite(JSON.parse(storedFavorite));
  }, [MyShopId, userShopId]);
  
  
  // Toggle favorite status
  const toggleFavorite = useCallback(async () => {
    if (loading || !session) {
      if (!session) {
        toast.error("You must be logged in to add favorites!");
        setTimeout(() => window.location.href = "/login", 1500);
      }
      return;
    }
   
    setLoading(true);
    const newFavoriteStatus = !favorite;

    try {
      const response = await fetch("/api/subscribeShop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          myShopUserID: MyShopId,
          shopUserID: userShopId,
          myShopEmail: myshopEmailID,
          isFavorited: newFavoriteStatus,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setFavorite(newFavoriteStatus);
        toast.success(newFavoriteStatus ? "Subscribed successfully!" : "Removed from favorites!");

        // Update localStorage
        newFavoriteStatus
          ? localStorage.setItem(`favorite-${MyShopId}-${userShopId}`, JSON.stringify(true))
          : localStorage.removeItem(`favorite-${MyShopId}-${userShopId}`);
      } else {
        throw new Error(data.error || "Failed to update favorite status");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [favorite, loading, session, MyShopId, userShopId, myshopEmailID]);

  return (
    <div className={styles.card}>
      <div className={styles.shopImg}>
        <img src={image} alt={shopName} className={styles.image} />
        {offer && (
          <div className={styles.offerSection}>
            <p className={styles.offerText}>{offer + "%"}</p>
            <span className={styles.offerLabel}>OFF</span>
          </div>
        )}
      </div>

      <div className={styles.details}>
        <h2 className={styles.shopName}>{shopName}</h2>
        <p className={styles.shopDescription}>{shopDescription}</p>

        <div className={styles.importantDetail}>
          <AverageRating shopKeeperID={userShopId} />
          <p className={styles.distance}>
            <span className="icon-map-signs"></span> {distance}
          </p>
        </div>

        <div className={styles.trackLocation}>
          <Link href={contact}>
            <span className="icon-shop"></span> View Shop
          </Link>
          <Link href={`https://www.google.com/maps?q=${latitude},${longitude}`} target="_blank">
            <span className="icon-location"></span> Track Now
          </Link>
        </div>
      </div>

      <div className={`${styles.favoriteIcon} ${loading ? styles.disabled : ""}`} onClick={toggleFavorite}>
        <div className={favorite ? styles.active : ""}>
          <span className="icon-heart"></span>
        </div>
      </div>

      {isFeatured && <PremiumBadge Premium={true} />}
    </div>
  );
};

export default ProductCard;
