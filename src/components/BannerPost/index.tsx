import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styles from "./banner.module.scss";

const bannerSlides = [
  {
    title: "🚀 Over 10 Lakh+ Active Ads",
    description: "Find everything from mobile phones to real estate in one place.",
  },
  {
    title: "🏠 Buy, Sell, Rent & Exchange",
    description: "Post your ad in seconds and connect with verified buyers or renters.",
  },
  {
    title: "📱 Mobile-Friendly Experience",
    description: "Browse and post ads easily on any device, anytime.",
  },
  {
    title: "🔍 Smart Search & Filters",
    description: "Quickly find what you need with category-based filtering and location targeting.",
  },
  {
    title: "💼 Trusted by Professionals",
    description: "Used by agents, dealers, and individuals across India.",
  },
  {
    title: "🛡️ Safe & Secure Platform",
    description: "Your data is protected and your listings are moderated for quality.",
  },
];

const BannerPost = () => {
  const autoplayOptions = {
    delay: 3000, // ⏱ Change to 5000 for 5 seconds
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: false,
    },
    [Autoplay(autoplayOptions)]
  );

 

  return (
    <div className={styles.bannerWrapper}>
      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.embla__container}>
          {bannerSlides.map((slide, index) => (
            <div className={styles.embla__slide} key={index}>
              <div className={styles.slideContent}>
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerPost;
