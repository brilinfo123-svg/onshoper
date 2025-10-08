"use client";
import React, { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./EmblaSlider.module.scss";

const EmblaSlider = ({ slides }) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className={styles.embla}>
      <div className={styles.emblaViewport} ref={emblaRef}>
        <div className={styles.emblaContainer}>
          {slides.map((src, index) => (
            <div className={styles.emblaSlide} key={index}>
              <img src={src} alt={`slide-${index}`} className={styles.emblaSlideImg} />
            </div>
          ))}
        </div>
      </div>

      <button className={styles.emblaPrev} onClick={scrollPrev}>‹</button>
      <button className={styles.emblaNext} onClick={scrollNext}>›</button>
    </div>
  );
};

export default EmblaSlider;
