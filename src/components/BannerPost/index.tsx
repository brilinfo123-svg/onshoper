// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import useEmblaCarousel from "embla-carousel-react";
// import Autoplay from "embla-carousel-autoplay";
// import Image from "next/image";
// import styles from "./banner.module.scss";

// const bannerSlides = [
//   { desktop: "/images/banner1_4K.png", mobile: "/images/banner1_Mobile.jpg" },
//   // { desktop: "/images/banner2_4K.jpg", mobile: "/images/banner3_mobile.jpg" },
//   // { desktop: "/images/banner5.jpg", mobile: "/images/banner4_mobile.jpg" },
//   // { desktop: "/images/banner2_4K.jpg", mobile: "/images/banner2_mobile.jpg" },
// ];

// export default function BannerPost() {
//   const [isMobile, setIsMobile] = useState(false);
//   const [mounted, setMounted] = useState(false);
//   const [selectedIndex, setSelectedIndex] = useState(0);

//   const autoplayOptions = {
//     delay: 4500,
//     stopOnInteraction: false,
//     stopOnMouseEnter: true,
//     playOnInit: true,
//   };

//   const [emblaRef, emblaApi] = useEmblaCarousel(
//     {
//       loop: true,
//       align: "center",
//       slidesToScroll: 1,
//       dragFree: false,
//       duration: 25,
//       skipSnaps: false,
//       containScroll: "trimSnaps",
//     },
//     [Autoplay(autoplayOptions)]
//   );

//   // ===============================
//   // SELECTED INDEX HANDLER
//   // ===============================
//   const onSelect = useCallback(() => {
//     if (!emblaApi) return;
//     setSelectedIndex(emblaApi.selectedScrollSnap());
//   }, [emblaApi]);

//   useEffect(() => {

//     if (!emblaApi) return;
  
//     onSelect();
  
//     emblaApi.on(
//       "select",
//       onSelect
//     );
  
  
//     return () => {
//       emblaApi.off(
//         "select",
//         onSelect
//       );
//     };
  
//   }, [emblaApi, onSelect]);

//   // ===============================
//   // SCREEN SIZE CHECK
//   // ===============================
//   useEffect(() => {
//     setMounted(true);

//     const checkScreen = () => {
//       setIsMobile(window.innerWidth <= 768);
//     };

//     checkScreen();
//     window.addEventListener("resize", checkScreen);

//     return () => window.removeEventListener("resize", checkScreen);
//   }, []);

//   if (!mounted) return null;

//   // ===============================
//   // RENDER
//   // ===============================
//   return (
//     <div className="container">
//       <div className={styles.bannerWrapper}>
//         {/* Slider */}
//         <div className={styles.embla} ref={emblaRef}>
//           <div className={styles.embla__container}>
//             {bannerSlides.map((slide, index) => {
//               const imageSrc = isMobile ? slide.mobile : slide.desktop;

//               return (
//                 <div className={styles.embla__slide} key={index}>
//                   <Image
//                     src={imageSrc || "/images/banner1_4K.png"}
//                     alt={`banner-${index}`}
//                     width={1920}
//                     height={400}
//                     sizes="100vw"
//                     loading={index === 0 ? "eager" : "lazy"}
//                     priority={index === 0}
//                     quality={75}
//                     className={styles.bannerImage}
//                     onError={() => console.log("Image failed:", imageSrc)}
//                   />
//                 </div>
//               );
//             })}
//           </div>
//         </div>

//         {/* Dots */}
//         <div className={styles.dots}>
//           {bannerSlides.map((_, index) => (
//             <button
//               key={index}
//               aria-label={`Go to slide ${index + 1}`}
//               className={`${styles.dot} ${
//                 selectedIndex === index ? styles.activeDot : ""
//               }`}
//               onClick={() => emblaApi?.scrollTo(index)}
//             />
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import styles from "./banner.module.scss";

const banner = {
  desktop: "/images/banner1_4K.png",
  mobile: "/images/banner1_Mobile.jpg",
};

export default function BannerPost() {
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const checkScreen = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  if (!mounted) return null;

  const imageSrc = isMobile ? banner.mobile : banner.desktop;

  return (
    <div className="container">
      <div className={styles.bannerWrapper}>
        <div className={styles.singleBanner}>
          <Image
            src={imageSrc}
            alt="main-banner"
            width={1920}
            height={400}
            sizes="100vw"
            loading="eager"         
            priority
            fetchPriority="high"
            quality={80}
            className={styles.bannerImage}
          />
        </div>
      </div>
    </div>
  );
}
