"use client";
import React, { useState, useEffect } from "react";
import Style from "./index.module.scss";
import FilterLocation from "@/components/FilterLocation/Index";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Banner from "../Banner/Index";
import useMediaQuery from "../../../hooks/useMediaQuery";


const Header: React.FC = () => {
  const isDesktop = useMediaQuery("(min-width: 992px)");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { data: session } = useSession();

  const handleProtectedRedirect = (path: string) => {
    if (session?.user) {
      router.push(path);
    } else {
      router.push("/login");
    }
  };
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 991);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", checkIsMobile);
    };
  }, []);

  const handleCityChange = (city: string, isManual: boolean = false) => {
    localStorage.setItem("selectedCity", city);
    if (isManual) {
      router.push({ pathname: "/filter", query: { city } });
    }
  };

  const HeaderSkeleton = () => (
    <header className={Style.header}>
      <div className={Style.headerWrapper}>
        <div className={Style.logoSkeleton}>
          <div className={Style.skeletonLogo}></div>
        </div>
        {!isMobile && (
          <div className={Style.bannerSkeleton}>
            <div className={Style.skeletonBanner}></div>
          </div>
        )}
        <ul className={Style.rightMenus}>
          <li><div className={Style.skeletonButton}></div></li>
          <li><div className={Style.skeletonNotification}></div></li>
          <li><div className={Style.skeletonAccount}></div></li>
        </ul>
      </div>
    </header>
  );

  if (isLoading) return <HeaderSkeleton />;

  return (
    <header className={Style.header}>
      {!isDesktop && (
        <div className={Style.MobileTopbar}>
          <Link href="/">
            <div className={Style.logo}>
              <h3>ON Aaaksh</h3>
              <div className={Style.logoDesc}>
                <h4>Shoper</h4>
                <span>Sale & Rent</span>
              </div>
            </div>
          </Link>
          <FilterLocation onCityChange={handleCityChange} />
        </div>
      )}

      <div className={Style.headerWrapper}>
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
        </div>

        <ul className={Style.rightMenus}>
          {!isMobile && (
            <li>
              <Link href="/ProductForm" className={`${Style.sellAdd} icon-shop`} rel="noopener noreferrer">
                Sale/Rent
              </Link>
            </li>
          )}
         <li className={Style.notificationItem}>
            <div className={`${Style.Notification} icon-bell`} role="button" tabIndex={0} onClick={() => handleProtectedRedirect("/ProductForm")}
            />
          </li>

          <li className={Style.favoriteItem}>
            <div className={`${Style.favoriteTrigger} icon-heart`} role="button" tabIndex={0} onClick={() => handleProtectedRedirect("/ProductForm")}
            />
          </li>
        </ul>
      </div>
    </header>
  );
};

export default Header;
