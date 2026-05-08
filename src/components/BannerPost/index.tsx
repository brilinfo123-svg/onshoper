import React, { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styles from "./banner.module.scss";
import Image from "next/image";

const bannerSlides = [
  {
    desktop: "/images/banner1_4K.png",
    mobile: "/images/banner1_Mobile.jpg",
  },
  {
    desktop: "/images/banner2_4K.jpg",
    mobile: "/images/banner3_mobile.jpg",
  },
  {
    desktop: "/images/banner5.jpg",
    mobile: "/images/banner4_mobile.jpg",
  },
  {
    desktop: "/images/banner2_4K.jpg",
    mobile: "/images/banner2_mbile.jpg",
  },
  
];

const BannerPost = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Active dot
  const [selectedIndex, setSelectedIndex] = useState(0);

  // ✅ Smooth autoplay
  const autoplayOptions = {
    delay: 4500,
    stopOnInteraction: false,
    stopOnMouseEnter: true,
    playOnInit: true,
  };

  // ✅ Smooth Embla Config
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "center",
      slidesToScroll: 1,
      dragFree: false,

      // 👇 smoother transition
      duration: 40,

      // 👇 smoother dragging
      skipSnaps: false,

      // 👇 smooth edge handling
      containScroll: "trimSnaps",
    },
    [Autoplay(autoplayOptions)]
  );

  // Active dot update
  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Screen detection
  useEffect(() => {
    setMounted(true);

    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);

    return () => {
      window.removeEventListener("resize", checkScreen);
    };
  }, []);

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="container">
      <div className={styles.bannerWrapper}>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.embla__container}>
            {bannerSlides.map((slide, index) => (
              <div className={styles.embla__slide} key={index}>
                <Image
                  src={isMobile ? slide.mobile : slide.desktop}
                  alt={`banner-${index}`}
                  fill
                  priority={index === 0}
                  quality={100}
                  className={styles.bannerImage}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stylish Dots */}
        <div className={styles.dots}>
          {bannerSlides.map((_, index) => (
            <button
              key={index}
              aria-label={`Go to slide ${index + 1}`}
              className={`${styles.dot} ${
                selectedIndex === index ? styles.activeDot : ""
              }`}
              onClick={() => emblaApi?.scrollTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerPost;