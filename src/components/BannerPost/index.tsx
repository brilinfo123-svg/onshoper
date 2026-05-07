import React from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import styles from "./banner.module.scss";
import Image from "next/image";


// const bannerSlides = [
//   { title: "🛒 Buy Sell & Rent Old Accessories", description: "List your pre-owned items in seconds and reach people looking to buy or rent." },
//   { title: "✨ A New Marketplace Experience", description: "Onshoper is fresh and growing — discover deals on electronics, fashion, furniture, and more." },
//   { title: "📱 Easy to Use on Any Device", description: "Post ads and browse listings seamlessly on mobile, tablet, or desktop." },
//   { title: "🔎 Find What You Need Fast", description: "Smart filters by category, price, and location help you connect with the right audience." },
//   { title: "🤝 Connect with Real People", description: "Trusted platform for individuals, agents, and small businesses to buy, sell, or rent accessories." },
//   { title: "🛡️ Safe & Transparent Deals", description: "We protect your data and moderate listings to keep the marketplace secure and fair." },
//   { title: "🌱 Promote Reuse & Sustainability", description: "Give old accessories a second life — save money and reduce waste while helping others." },
//   { title: "🚀 Growing Community", description: "Be part of a new marketplace that’s expanding every day with fresh listings and opportunities." },
// ];


const bannerSlides = [
  { image: "/images/banner2_4k.jpg" },
  { image: "/images/banner3_4k.jpg" },
  { image: "/images/banner1_4K.png" },
];

const BannerPost = () => {
  const autoplayOptions = {
    delay: 5000,
    stopOnInteraction: false,
    stopOnMouseEnter: false,
  };

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      slidesToScroll: 1,
      dragFree: false,
    },
    [Autoplay(autoplayOptions)]
  );

  return (
    <div className="container">
      <div className={styles.bannerWrapper}>
        <div className={styles.embla} ref={emblaRef}>
        <div className={styles.embla__container}>
            {bannerSlides.map((slide, index) => (
              <div className={styles.embla__slide} key={index}>
                <Image
                    src={slide.image}
                    alt={`banner-${index}`}
                    fill
                    className={styles.bannerImage}
                  />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPost;
