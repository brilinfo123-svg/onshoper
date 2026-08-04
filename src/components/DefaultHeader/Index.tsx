"use client";
import React, { useState, useEffect } from "react";
import Style from "./index.module.scss";
import FilterLocation from "@/components/FilterLocation/Index";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Banner from "../Banner/Index";
import useMediaQuery from "../../../hooks/useMediaQuery";
import { useFilter } from "@/contexts/FilterContext";
import Swal from "sweetalert2";

import WelcomeChoice from "@/components/WelcomeChoice/Index";


const Header: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");
  const router = useRouter();
  // const [setIsLoading] = useState(true);
  const isMobile = !isDesktop;
  const { data: session } = useSession();
  const { filterType, setFilterType } = useFilter();
  const [isSticky, setIsSticky] = useState(false);
  const [showChoice, setShowChoice] = useState(false);


  
  const handleProtectedRedirect = (path: string) => {
    if (session?.user) {
      router.push(path);
    } else {
      router.push("/login");
    }
  };

    const handleFilterChange = (type: "Sale" | "Rent" | "all") => {
    
      const messageMap = {
        Sale: "Switched to Sale ads",
        Rent: "Switched to Rental ads",
        all: "Exploring all ads",
      };
    
      // ✅ Show SweetAlert message
      Swal.fire({
        position: "center",
        icon: "success",
        title: messageMap[type],
        showConfirmButton: false,
        timer: 1500,
        customClass: {
          title: "swal-title-small", // 👈 Custom class for title
        },
      });
    
      setTimeout(() => {
        setFilterType(type);
        // setIsLoading(false);
        const target = document.querySelector("#products-section");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 1000);
    };

  // useEffect(() => {
  //   const checkIsMobile = () => setIsMobile(window.innerWidth <= 991);
  //   checkIsMobile();
  //   window.addEventListener("resize", checkIsMobile);

  //   // const timer = setTimeout(() => setIsLoading(false), 800);
  //   return () => {
  //     // clearTimeout(timer);
  //     window.removeEventListener("resize", checkIsMobile);
  //   };
  // }, []);

    useEffect(() => {
      const handleScroll = () => {
        if (window.scrollY > 50) {
          setIsSticky(true);   // ✅ scroll down → add sticky class
        } else {
          setIsSticky(false);  // ✅ scroll top → remove sticky class
        }
      };
  
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }, []);
    
  const handleCityChange = (city: string, isManual: boolean = false) => {
    localStorage.setItem("selectedCity", city);
    if (isManual) {
      router.push({ pathname: "/filter", query: { city } });
    }
  };

    useEffect(() => {
      const choice = localStorage.getItem("homeChoice");

      if (!choice) {
        setShowChoice(true);
      }
    }, []);

    const handleWelcomeChoice = (type: "Sale" | "Rent" | "all") => {
      localStorage.setItem("homeChoice", type);
      handleFilterChange(type);
      setShowChoice(false);
    };

  return (
    <header className={Style.header}>
      {!isDesktop && (
        <div className={Style.MobileTopbar}>
          <Link href="/">
            <div className={Style.logo}>
              <h3>ON</h3>
              <div className={Style.logoDesc}>
                <h4>Shoper</h4>
                <span>Sale & Rent</span>
              </div>
            </div>
          </Link>
          <div className={Style.wrapper}>
          <div className={Style.toggleWrapper}>
            <div className={Style.toggleTrack}>
              <div className={`${Style.toggleThumb} ${Style[filterType]}`}/>
              <button aria-label="Sale" onClick={() => handleFilterChange("Sale")} className={filterType === "Sale" ? Style.active : ""}>Sale</button>
              <button aria-label="Rent" onClick={() => handleFilterChange("Rent")} className={filterType === "Rent" ? Style.active : ""}>Rental</button>
              <button aria-label="all" onClick={() => handleFilterChange("all")} className={filterType === "all" ? Style.active : ""}>All</button>
            </div>
          </div>

          <FilterLocation onCityChange={handleCityChange} />
          </div>
        </div>
      )}

    <div className={`${Style.headerWrapper} ${isSticky ? Style.isSticky : ""}`}>
        {!isMobile && (
          <div className={Style.logoSection}>
            <Link href="/">
              <div className={Style.logo}>
                <h3>ON</h3>
                <div className={Style.logoDesc}>
                  <h4>Shoper</h4>
                  <span>Sale & Rent</span>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className={Style.filterLocationWrapper}>
          {!isMobile && <FilterLocation onCityChange={handleCityChange} />}
          <Banner />
          {showChoice && (
            <WelcomeChoice onChoose={handleWelcomeChoice} />
          )}
          {!isMobile && 
          <div className={Style.toggleWrapper}>
            <div className={Style.toggleTrack}>
              <div className={`${Style.toggleThumb} ${Style[filterType]}`}/>
              <button aria-label="Sale" onClick={() => handleFilterChange("Sale")} className={filterType === "Sale" ? Style.active : ""}>Buy</button>
              <button aria-label="Rent" onClick={() => handleFilterChange("Rent")} className={filterType === "Rent" ? Style.active : ""}>Rental</button>
              <button aria-label="all" onClick={() => handleFilterChange("all")} className={filterType === "all" ? Style.active : ""}>All</button>
            </div>
          </div>
          }
        </div>

        <ul className={Style.rightMenus}>
          {!isMobile && (
            <li><Link href="/ProductForm" className={`${Style.sellAdd} icon-plus`} rel="noopener noreferrer">POST</Link></li>
          )}

          <li className={Style.favoriteItem}>
            <div className={`${Style.favoriteTrigger} icon-heart-empty`} role="button" tabIndex={0} onClick={() => handleProtectedRedirect("/ProductForm")}></div>
            
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
