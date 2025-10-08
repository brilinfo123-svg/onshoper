"use client";

import React, { ReactNode, useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import styles from "./index.module.scss";
import OffersBadge from "./OffersBadge/Index";
import Link from "next/link";
import Skeleton from "@/components/OfferSliderSkeleton/Index";
import Image from "next/image";
import { formatPostedTime } from "../ProductPost/Index";

interface Product {
  priceWeek: number;
  priceMonth: number;
  location: string;
  SalePrice: string;
  price: string;
  _id: string;
  title: string;
  coverImage?: string;
  images?: string[];
  description?: string;
  feature?: boolean;
  discount?: string;
  createdAt?: string
}

const OPTIONS: EmblaOptionsType = {
  loop: true,
  align: "start",
  slidesToScroll: 1,
  dragFree: true,
};

const OffersSlider: React.FC = () => {
  const [offers, setOffers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [emblaRef, emblaApi] = useEmblaCarousel(OPTIONS);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch("/api/Search");
        const json = await res.json();

        if (json.success) {
          const featuredProducts = (json.data || []).filter(
            (product: Product) => product.feature === false
          );
          setOffers(featuredProducts);
        } else {
          console.error("Failed to fetch products:", json.message);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className={styles.sliderContainer}>
      {loading ? (
        <Skeleton count={4} />
      ) : (
        <div className={styles.embla}>
          {/* viewport */}
          <div className={styles.embla__viewport} ref={emblaRef}>
            <div className={styles.embla__container}>
              {offers.map((product) => (
                <div className={styles.embla__slide} key={product._id}>
                  <Link href={`/product/${product._id}`}>
                    <div
                      className={`${styles.slideContent} ${styles.equalSlideContent}`}
                    >
                      <div className={styles.badgeWrapper}>
                        <OffersBadge
                          value={product.discount || "Featured"}
                          class="slideContent"
                        />
                        {product.coverImage && (
                          <Image
                            src={product.coverImage}
                            width={100}
                            height={100}
                            alt={product.title}
                          />
                        )}
                      </div>

                      <div className={styles.slideText}>
                        <div className={styles.shpOfferDetail}>
                          {/* Title one line */}
                          <h3>
                            {product.title && product.title.length > 28
                              ? product.title.slice(0, 28) + "..."
                              : product.title}
                          </h3>

                          {/* Description one line */}
                          {/* <p>
                            {product.description
                              ? product.description.length > 38
                                ? product.description.slice(0, 38) + "..."
                                : product.description
                              : "No description"}
                          </p> */}

                          <div className={styles.moreDetails}>
                            {/* <span className={`${styles.PriceOfProduct} ${"icon-location"}`}>
                              {product.location && product.location.slice(0, 22) + (product.location.length > 22 ? "..." : "")}
                            </span> */}

                            {/* Price Wrapper */}
                            <div className={styles.priceWrapper}>
                                {Number(product?.price) > 0 && (
                                  <span>₹<span className={styles.PriceNumber}>{product.price}</span> / Day</span>
                                )}

                                {Number(product?.priceWeek) > 0 && (
                                  <span>₹<span className={styles.PriceNumber}>{product.priceWeek}</span> / Week</span>
                                )}

                                {Number(product?.priceMonth) > 0 && (
                                  <span>₹<span className={styles.PriceNumber}>{product.priceMonth}</span> / Month
                                  </span>
                                )}

                                {/* Only show SalePrice if it exists */}
                                {product?.SalePrice && (
                                  <span className={styles.PriceNumber}>₹{product.SalePrice}</span>
                                )}
                              </div>

                              <span className={styles.timeStamp}>
                                <p>{formatPostedTime(product?.createdAt)}</p>
                              </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Prev / Next buttons */}
          <button className={styles.embla__buttonPrev} onClick={scrollPrev}>
            ◀
          </button>
          <button className={styles.embla__buttonNext} onClick={scrollNext}>
            ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default OffersSlider;
