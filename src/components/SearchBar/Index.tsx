"use client";
import React, { useState } from "react";
import Style from "@/components/Banner/Index.module.scss";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PickupLocationSearch from "@/components/PickupLocationSearch/Index";

interface Props {
  bannerClass?: any;
  searchTitle?: any;
  searchDesc?: any;
  onLocationFilter: (location: string) => void; // Add this prop
}

const Banner: React.FC<Props> = ({ bannerClass, searchTitle, searchDesc, onLocationFilter }) => {
  const [locationTerm, setLocationTerm] = useState<string>("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const router = useRouter();

  const handleSearch = () => {
    if (!locationTerm) return;
    
    // Pass the location to the parent component
    if (onLocationFilter) {
      onLocationFilter(locationTerm);
    }
    
    // Also update URL if needed
    const params = new URLSearchParams();
    params.append("location", locationTerm);
    if (latitude) params.append("lat", latitude.toString());
    if (longitude) params.append("lng", longitude.toString());
    router.push(`/filter?${params.toString()}`);
  };

  return (
    <div className={`${Style.banner} ${bannerClass}`}>
      <div className={Style.content}>
        <div className={Style.bannerContent}>
          <h1 className={Style.heading}>{searchTitle}</h1>
          <p className={Style.text}>{searchDesc}</p>
        </div>

        <div className={Style.searchSection}>
          <div className={Style.searchBox}>
            <div className={Style.formGroup}>
              <label><span className="icon-map-pin"></span>Enter Your Location</label>
              <PickupLocationSearch
                setLat={(lat) => setLatitude(lat)}
                setLng={(lng) => setLongitude(lng)}
                setAddress={(address) => setLocationTerm(address)} onLocationUpdate={undefined}              />
            </div>
          </div>

          <button className={Style.searchButton} onClick={handleSearch}>
            <span role="img" aria-label="Search" className="icon-search-1"></span>
          </button>
        </div>

        <div className={`${Style.bannerContent} ${Style.bannerContentLink}`}>
          <Link href="/watch">
            <span className="icon-map-signs"></span> Search For Rent
          </Link>
          <Link href="/category">
            <span className="icon-shop"></span> Search For Buy
          </Link>
        </div>
      </div>

      <div className={Style.imgWrap1}>
        <Image src={"/images/vendor.png"} width={262} height={262} alt="Vendors" />
      </div>
      <div className={Style.imgWrap2}>
        <Image src={"/images/Vendor2.png"} width={262} height={262} alt="Vendors" />
      </div>
    </div>
  );
};

export default Banner;