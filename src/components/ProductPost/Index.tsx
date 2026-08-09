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
import NProgress from "nprogress";

export function formatPostedTime(utcDate: string | Date) {
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
  SaleType?: "Sale" | "Rent";
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
  onSold?: (id: string) => void;
  status?: string;
  year?: number;
  KmDriven?: number;
  mobileBrand?: string;
  mobileModel?: string;
  salaryFrom?: number;
  salaryTo?: number; 
  salaryPeriod?: string;
  positionType?: string;
  className?: string;
  CtaClassName?: string;
  CoverImgClass?: string;
  favoriteIconeClass?: string;
  onRepublish?: (id: string) => void;
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
  SaleType,
  showOnlyWishlistItems,
  onUnfavorite,
  onDelete,
  onUpdate,
  onSold,
  onRepublish,
  status,
  year,
  KmDriven,
  mobileBrand,
  mobileModel,
  salaryFrom,
  salaryTo,
  salaryPeriod,
  positionType,
  className,
  CoverImgClass,
  favoriteIconeClass,
  CtaClassName
}: ProductCardProps) => {
  const { data: session } = useSession();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites(); // Use the context
  // const [favorite, setFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const favorite = isFavorite(_id);

  
  // ✅ Check if this product is already in favorites from context
  // useEffect(() => {
  //   setFavorite(isFavorite(_id));
  // }, [_id, isFavorite]);

// ✅ Also check if it's in the user's favorites from the API
// useEffect(() => {
//   if (!session?.user?.contact) return;

//   let isMounted = true; // guard for unmounted component

//   const checkFavorite = async () => {
//     try {
//       const res = await fetch("/api/favorites/isFavourite", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           userId: session.user.contact,
//           productId: _id,
//         }),
//       });

//       if (!res.ok) throw new Error("Failed to check favorite");

//       const data = await res.json();

//       if (isMounted && data.isFavourite) {
//         setFavorite(true);

//         // ✅ only add to context if not already there
//         if (!isFavorite(_id)) {
//           addFavorite(_id);
//         }
//       }
//     } catch (err) {
//       console.error("❌ Error checking favorite:", err);
//     }
//   };

//   checkFavorite();

//   return () => {
//     isMounted = false; // ✅ cleanup
//   };
// }, [_id, session?.user?.contact]); // ✅ simplified dependencies


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
        shopOwnerID,
        isFavorited: !favorite,
      }),
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    if (data.success) {
      if (favorite) {
        removeFavorite(_id);
        onUnfavorite?.(_id);
        toast.success("Removed from wishlist");
      } else {
        addFavorite(_id);
        toast.success("Added to wishlist");
      }
    }
  } catch (err) {
    toast.error("Something went wrong");
  } finally {
    setLoading(false);
  }
};



  const handleClick = () => {
     NProgress.start(); 
    };

  if (showOnlyWishlistItems && !favorite) return null;
  return (
    <div className={`${styles.card} ${filter.card} ${className || ""}`}>
      <Link href={`/product/${_id}`} className={styles.button} onClick={handleClick}>
        <div className={`${styles.ProductCoverImg} ${filter.ProductCoverImg} ${CoverImgClass || ""}`}>
        {SaleType === "Rent" && (
          <span className={styles.rentBadge}>
            FOR RENT
          </span>
        )}
        <Image src={coverImage || images?.[0] || "/images/placeholder.jpg"} alt={title} width={500}  height={300}  className={`${styles.image} ${filter.image}`} sizes="(max-width:500px) 100vw, 300px" quality={70} loading="lazy" />
        <span className={`${styles.timeStamp} ${filter.timeStamp}`}>
          <p>{formatPostedTime(createdAt)}</p>
        </span>
        </div>

        <div className={`${styles.content} ${filter.content}`}>
        <div className={filter.ProductContentWrap}>
        <span className={styles.category}>
          {category} {">"} {subCategory}
        </span>
        <div className={styles.flexRowPrice}>
        <div className={`${styles.prices}`}>
          {/* ✅ Show salary for Jobs */}
          {category?.toLowerCase() === "jobs" && (salaryFrom || salaryTo) && (
            <div className={styles.salaryPrice}>
              <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                {salaryFrom ? `₹${Number(salaryFrom).toLocaleString("en-IN")}` : ""}
                {salaryFrom && salaryTo ? " - " : ""}
                {salaryTo ? `₹${Number(salaryTo).toLocaleString("en-IN")}` : ""}
                {/* {salaryPeriod && (<span className={style.priceType}>{salaryPeriod}</span>)} */}
              </span>
              {/* <span className={style.priceType}>{salaryPeriod}</span> */}
            </div>
          )}
          {/* ✅ Existing price logic */}
          {price > 0 && (
            <div className={styles.salaryPrice}>
              <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                ₹{price}<span>/</span>
              </span>
              <span className={style.priceType}>Per Day</span>
            </div>
          )}
          {priceWeek > 0 && (
            <div className={styles.salaryPrice}>
              ₹<span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
                {priceWeek}<span>/</span>
              </span>
              <span className={style.priceType}>Weekly</span>
            </div>
          )}
          {priceMonth > 0 && (
            <div className={styles.salaryPrice}>
              <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
              ₹{priceMonth}<span>/</span>
              </span>
              <span className={style.priceType}>Monthly</span>
            </div>
          )}
          {SalePrice > 0 && (
            <div className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
              ₹{SalePrice}<span>/</span>
            </div>
          )}
          <span className={`${styles.PriceNumber} ${filter.PriceNumber}`}>
            {SalePrice}
          </span>
        </div>
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
                  if (mobileModel) {
                    extraText += `${mobileModel || ""}`.trim();
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
                    {extraText && <span className={style.extraText}>{extraText}</span>}
                  </>
                );
              })()}
          </h2>


          <div className={styles.descWrap}>
            <p className={styles.description}>
              {description.length > 80 ? description.slice(0, 80) + "..." : description}
            </p>
            <span className={`${"icon-location"} ${filter.location}`}>
            {location?.area
              ? `${location?.city} / ${location?.area}`
              : location?.state && location?.city
              ? `${location?.state} / ${location?.city}`
              : location?.state || location?.city || "Location not available"}
          </span>

          </div>
          </div>
          {/* CTA Buttons */}
          
          
          {isFeatured && <PremiumBadge Premium={isFeatured} />}
        </div>
      </Link>
      <div className={`${styles.CtaBtn} ${CtaClassName || ""}`}>
            {/* {!onUpdate && !onDelete && (<Link href={`/product/${_id}`} className={styles.button}>View Details</Link>)} */}
            {/* {status !== "sold" && onUpdate && (<button aria-label="Update" className={`${styles.updateBtn}`} onClick={(e) => {e.preventDefault(); e.stopPropagation(); router.push(`/product/productUpdate/${_id}`);}}><i className="icon-pencil"></i> Update</button>)} */}
            {status !== "sold" && onUpdate && (<button aria-label="Update" className={styles.updateBtn} onClick={(e) => { e.preventDefault(); e.stopPropagation(); onUpdate(_id);}}><i className="icon-pencil"></i> Update</button>)}

            {status !== "sold" && onSold && (<button aria-label="Mark Sold" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onSold(_id);}} className={`${styles.soldBtn}`}><i className="icon-ok-circled"></i>  Mark Sold</button>)}
            {onDelete && (<button aria-label="Delete" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(_id);}} className={`${styles.deleteBtn}`}><i className="icon-trash-delete"></i> Delete</button>)}
            {status === "sold" && onRepublish && (
            <button aria-label="Publish" className={styles.republishBtn} onClick={(e) => {e.stopPropagation(); onRepublish(_id);}}><i className="icon-ccw"></i> Republish</button>)}
          </div>
      <div className={`${style.favoriteIcon} ${favoriteIconeClass || ""} ${loading ? style.disabled : ""}`} onClick={toggleFavorite}>
        <div className={favorite ? style.active : ""}>
          <span className="icon-heart"></span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;