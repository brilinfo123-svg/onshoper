"use client";

import Link from "next/link";
import styles from "@/styles/ProductPost.module.scss";
import filter from "@/styles/filter.module.scss";
import style from "./Index.module.scss";
import { differenceInCalendarDays } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import PremiumBadge from "../PremiumBadge/Index";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import router, { useRouter } from "next/router";
import { useFavorites } from "@/contexts/FavoriteContext"; // Import the context
import Image from "next/image";

export function formatPostedTime(utcDate: string | Date) {
  const router = useRouter();
  const timeZone = "Asia/Kolkata";
  const zonedDate = toZonedTime(new Date(utcDate), timeZone);
  const now = toZonedTime(new Date(), timeZone);
  const daysAgo = differenceInCalendarDays(now, zonedDate);
  return daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
}

interface ProductCardProps {
  _id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  price: number;
  priceWeek?: number;
  priceMonth?: number;
  coverImage: string;
  images: string[];
  location?: {  // <-- Yahan change karo
    city?: string;
    area?: string;
    state?: string;
  };
  SalePrice?: number;
  createdAt: string;
  isFeatured: boolean;
  shopOwnerID: string;
  showOnlyWishlistItems?: boolean;
  onUnfavorite?: (_id: string) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string) => void;
  year?: number;
  KmDriven?: number;
  mobileBrand?: string;
  mobileModel?: string;
  salaryFrom?: number;
  salaryTo?: number; 
  salaryPeriod?: string;
  positionType?: string;
}

const ProductCard = ({
  _id,
  title,
  description,
  category,
  subCategory,
  isFeatured,
  price,
  priceWeek,
  priceMonth,
  SalePrice,
  coverImage,
  images,
  location,
  createdAt,
  shopOwnerID,
  showOnlyWishlistItems,
  onUnfavorite,
  onDelete,
  onUpdate,
  year,
  KmDriven,
  mobileBrand,
  mobileModel,
  salaryFrom,
  salaryTo,
  salaryPeriod,
  positionType,
}: ProductCardProps) => {
  const { data: session } = useSession();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites(); // Use the context
  const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  console.log("year", year);
  
  // ✅ Check if this product is already in favorites from context
  useEffect(() => {
    setFavorite(isFavorite(_id));
  }, [_id, isFavorite]);

  // ✅ Also check if it's in the user's favorites from the API
  useEffect(() => {
    const checkFavorite = async () => {
      if (!session?.user?.contact) return;

      const res = await fetch("/api/favorites/isFavourite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.contact,
          productId: _id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.isFavourite) {
        setFavorite(true);
        // Also add to context if it's not already there
        if (!isFavorite(_id)) {
          addFavorite(_id);
        }
      }
    };

    checkFavorite();
  }, [_id, session, isFavorite, addFavorite]);

  const toggleFavorite = async () => {
    if (!session?.user?.contact) {
      toast.error("Please login first!");
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/favorites/fetchWishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.contact,
          productId: _id,
          shopOwnerID: shopOwnerID,
          isFavorited: !favorite,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (!favorite) {
          addFavorite(_id); // Add to global favorites
        } else {
          removeFavorite(_id); // Remove from global favorites
        }
        
        setFavorite(!favorite);
        toast.success(!favorite ? "Added to wishlist" : "Removed from wishlist");

        if (onUnfavorite && favorite) {
          onUnfavorite(_id); // notify parent to remove this card
        }
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Failed to update favorite");
    }

    setLoading(false);
  };

  if (showOnlyWishlistItems && !favorite) return null;
  return (
    <div className={`${styles.card} ${filter.card}`}>
      <Link href={`/product/${_id}`} className={styles.button}>
        <Image src={coverImage || images?.[0] || "/images/placeholder.jpg"} alt={title} width={500}  height={300}  className={`${styles.image} ${filter.image}`} priority />

        <div className={`${styles.content} ${filter.content}`}>
        <div className={styles.flexRowPrice}>
        <div className={`${styles.prices}`}>
          {/* ✅ Show salary for Jobs */}
          {category?.toLowerCase() === "jobs" && (salaryFrom || salaryTo) && (
            <div>
              <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                {salaryFrom ? `₹${Number(salaryFrom).toLocaleString("en-IN")}` : ""}
                {salaryFrom && salaryTo ? " - " : ""}
                {salaryTo ? `₹${Number(salaryTo).toLocaleString("en-IN")}` : ""}
                {salaryPeriod && (<span className={style.priceType}> / {salaryPeriod}</span>)}
              </span>
              {/* <span className={style.priceType}>{salaryPeriod}</span> */}
            </div>
          )}
          {/* ✅ Existing price logic */}
          {price > 0 && (
            <div>
              <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                ₹{price}
              </span>
              <span className={style.priceType}> / Day</span>
            </div>
          )}
          {priceWeek > 0 && (
            <div>
              ₹<span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                {priceWeek}
              </span>
              <span className={style.priceType}> / Week</span>
            </div>
          )}
          {priceMonth > 0 && (
            <div>
              ₹<span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                {priceMonth}
              </span>
              <span className={style.priceType}> / Month</span>
            </div>
          )}
          {SalePrice > 0 && (
            <div className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
              ₹ {SalePrice}
            </div>
          )}
          <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
            {SalePrice}
          </span>
        </div>

        <span className={`${styles.timeStamp} ${filter.timeStamp}`}>
          <p>{formatPostedTime(createdAt)}</p>
        </span>
      </div>


          <h2>
              {(() => {
                let displayTitle = title;
                let extraText = " ";

                if (subCategory === "Cars" || subCategory === "Motorcycles") {
                  if (year) {
                    extraText += ` ${year}`;
                  }

                  if (KmDriven) {
                    const formattedKm = Number(KmDriven).toLocaleString("en-IN");
                    extraText += ` - ${formattedKm} km`;
                  }
                }

                if (subCategory === "Mobile Phones") {
                  if (mobileBrand || mobileModel) {
                    extraText += ` ${mobileBrand || ""} ${mobileModel || ""}`.trim();
                  }
                }
                if (category?.toLowerCase() === "jobs") {
                  if (positionType) {
                    extraText += `- (${positionType})`;
                  }
                }
                
                return (
                  <>
                    {displayTitle.length > 80
                      ? displayTitle.slice(0, 80) + "..."
                      : displayTitle}
                    {extraText && <span>{extraText}</span>}
                  </>
                );
              })()}
            </h2>


          <div className={styles.descWrap}>
            <p className={styles.description}>
              {description.length > 80 ? description.slice(0, 80) + "..." : description}
            </p>
            <span className={`${"icon-location"} ${filter.location}`}>{location?.area ? `${location?.city} / ${location?.area}` : `${location?.state} / ${location?.city}`}</span>
          </div>

          {/* CTA Buttons */}
          <div className={styles.CtaBtn}>
            {/* {!onUpdate && !onDelete && (<Link href={`/product/${_id}`} className={styles.button}>View Details</Link>)} */}
            {onUpdate && (<Link href={`/product/productUpdate/${_id}`} className={styles.updateBtn}>Update</Link>)}
            {onDelete && (<button onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(_id);}} className={styles.deleteBtn}>Delete</button>)}
          </div>
          {isFeatured && <PremiumBadge Premium={isFeatured} />}
        </div>
      </Link>
      <div className={`${style.favoriteIcon} ${loading ? style.disabled : ""}`} onClick={toggleFavorite}>
        <div className={favorite ? style.active : ""}>
          <span className="icon-heart"></span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;