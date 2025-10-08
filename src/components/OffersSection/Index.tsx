import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import styles from "@/components/OffersSection/Index.module.scss";

const OffersSection = () => {
  const offers = [
    {
      title: "Flat 20% off on Groceries",
      description: "Enjoy amazing !",
      expiryDate: "Expires on: Dec 31, 2024",
    },
    {
      title: "Buy 1 Get 1 Free at Cafe Bliss",
      description: "Treat yourself with free meals at Cafe Bliss. Don't miss out!",
      expiryDate: "Expires on: Jan 15, 2025",
    },
    {
      title: "15% off on Electronics Flat 20% off on Groceries",
      description: "Get the best deals on electronics and gadgets today!",
      expiryDate: "Expires on: Feb 28, 2025",
    },
    {
      title: "Free Delivery on All Orders",
      description: "Shop now and enjoy free delivery on all products!",
      expiryDate: "Expires on: Mar 10, 2025",
    },
  ];

  const sliderRef = useRef<HTMLDivElement>(null);
  const [maxTitleHeight, setMaxTitleHeight] = useState<number>(0);
  const [maxDescriptionHeight, setMaxDescriptionHeight] = useState<number>(0);

  useEffect(() => {
    const calculateHeights = () => {
      if (!sliderRef.current) return;

      const titleElements = sliderRef.current.querySelectorAll(`.${styles.offerTitle}`);
      const descriptionElements = sliderRef.current.querySelectorAll(`.${styles.offerDescription}`);

      let maxTitle = 0;
      let maxDescription = 0;

      titleElements.forEach((element) => {
        maxTitle = Math.max(maxTitle, element.clientHeight);
      });

      descriptionElements.forEach((element) => {
        maxDescription = Math.max(maxDescription, element.clientHeight);
      });

      setMaxTitleHeight(maxTitle);
      setMaxDescriptionHeight(maxDescription);
    };

    // Initial calculation
    calculateHeights();

    // Recalculate on window resize
    window.addEventListener("resize", calculateHeights);
    return () => window.removeEventListener("resize", calculateHeights);
  }, []);

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1200,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
    arrows: false,
    responsive: [
      {
        breakpoint: 1024, // For tablets
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 600, // For mobile
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <div className={styles.offersSection} ref={sliderRef}>
      <h2 className={styles.sectionTitle}>Current Offers</h2>
      <Slider {...sliderSettings}>
        {offers.map((offer, index) => (
          <div key={index} className={styles.slide}>
            <div className={styles.offerCard}>
              <Image
                src="/images/NewOffer.png"
                alt="Offer Image"
                width={100}
                height={100}
                className={styles.offerImage}
              />
              <h3
                className={styles.offerTitle}
                style={{ height: maxTitleHeight ? `${maxTitleHeight}px` : "auto" }}
              >
                {offer.title}
              </h3>
              <p
                className={styles.offerDescription}
                style={{ height: maxDescriptionHeight ? `${maxDescriptionHeight}px` : "auto" }}
              >
                {offer.description}
              </p>
              <p className={styles.offerExpiry}>{offer.expiryDate}</p>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default OffersSection;
