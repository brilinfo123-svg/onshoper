"use client";

import React from "react";
import Image from "next/image";
import styles from "./Index.module.scss";

type Choice = "Sale" | "Rent";

interface WelcomeChoiceProps {
  onChoose: (type: Choice) => void;
}

const WelcomeChoice: React.FC<WelcomeChoiceProps> = ({ onChoose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.heading}>

          <h2>What would you like to explore?</h2>

          <p>Choose how you'd like to explore OnShoper.
          <br></br>You can switch between Buy and Rent anytime from top menu.
          </p>
        </div>

        <div className={styles.cards}>
          {/* BUY */}
          <button
          aria-label="Sale"
            className={styles.card}
            onClick={() => onChoose("Sale")}
          >
            <div className={styles.icon}>
              <Image
                src="/images/bag-sale.svg"
                alt="Explore Products"
                width={115}
                height={115}
                priority
                style={{ width: "115px", height: "115px" }}
              />
            </div>

            <h3>Explore Sale Ads</h3>

            <span>
              Explore Now 
              <i className="icon-right"></i>
            </span>
          </button>

          {/* RENT */}
          <button
            aria-label="rent"
            className={styles.card}
            onClick={() => onChoose("Rent")}
          >
            <div className={styles.icon}>
              <Image
                src="/images/home-rent.svg"
                alt="Explore Rentals"
                width={115}
                height={115}
                priority
                style={{ width: "115px", height: "115px" }}
              />
            </div>

            <h3>Explore Rentals Ads</h3>

            <span>
              Explore Now
              <i className="icon-right"></i>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChoice;