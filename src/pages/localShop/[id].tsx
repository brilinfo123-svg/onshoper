"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import styles from "@/styles/Profile.module.scss";
import { withProtectedPage } from "@/components/withProtectedPage";
import Image from "next/image";
import Link from "next/link";
import Tabs from "@/components/Tabs/Index";
import UpdateDetail from "@/components/UpdateDetail/Index";
import ServiceList from "@/components/ServiceList/Index";
import { useSession } from "next-auth/react";
import AverageRating from "@/components/RatingAvrage/Index";

// Assuming you have a fetch function to get the shop details by ID
const fetchShopDetails = async (id: string) => {
  const response = await fetch(`/api/localShop/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch shop details");
  }
  return response.json();
};

interface ShopData {
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  [key: string]: any;
  registration: any;
  shop: any;
}

const ShopProfile: React.FC = () => {
  const router = useRouter();
  const { id } = router.query; // Get the shop's ID from the URL
  
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);

  const [shop, setShop] = useState<any>(null); // State to store shop details
  

    useEffect(() => {
      if (session?.user?.contact) {
        const fetchShopData = async () => {
          try {
            const response = await fetch(`/api/profile?userEmail=${session.user.email}`);
            if (response.ok) {
              const data: ShopData = await response.json();
              setShopData(data);
            } else {
              console.error("Error fetching shop data");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        };
        fetchShopData();
      }
    }, [session]);
    

  const ShopKeeperID = shop?._id;
  const VisitedUserShopID = shopData?.user?._id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  // const { formData } = useFormData();
  // const property = {
  //   title: "dvhjdbf",
  //   breadcrumbs: ["24AAACC1206D1ZM"],
  //   date: "June 21, 2019 8:26 pm",

  //   location: "Port Chester, New York",
  //   price: "My Services",
  //   description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
  //   seller: {
  //     name: "Address",
  //     address: "SCO 6, Mohali Airport Road, Sector 80, Sahibzada Ajit Singh Nagar, Punjab 140308, India",
  //     phone: "6735556XXXX",
  //     email: "brilinfo123@gmail.com",
  //     shopID: 4564564875485,
  //   },
  //   mapLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.918524!2d-73.67809!3d41.00149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2930c5c30a0ad%3A0xf9141d9cf7b3cbb6!2sPort%20Chester%2C%20NY%2010573%2C%20USA!5e0!3m2!1sen!2sin!4v1630484240914!5m2!1sen!2sin",
  //   details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi ipsum faucibus vitae aliquet. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas.`,
  //   openingHours: {
  //     Sunday: "Closed",
  //     Monday: "1:00 PM - 1:00 PM",
  //     Tuesday: "1:00 PM - 1:00 PM",
  //     Wednesday: "Closed",
  //     Thursday: "Closed",
  //     Friday: "1:00 AM - 11:00 PM",
  //     Saturday: "Closed",
  //   },
  // };
  // const products = [
  //   {
  //     image: "/images/img1.jpg",
  //     shopName: "Ravi Halwai",
  //     shopTitle: "Best Shop in Mohali",
  //     shopDescription: "20% off on every purchase",
  //     location: "Chandigarh",
  //     contact: "Track Now",
  //     distance: "2KM",
  //     isFavorite: false,
  //   },
  //   {
  //     image: "/images/img2.jpg",
  //     shopName: "Sundar Kirana Store",
  //     shopTitle: "Best Shop in Mohali",
  //     shopDescription: "20% off on every purchase ",
  //     location: "Chandigarh",
  //     contact: "Track Now",
  //     distance: "1.7KM",
  //     isFavorite: false,
  //   },
  //   {
  //     image: "/images/img3.jpg",
  //     shopName: "Shakti Medical",
  //     shopTitle: "Best Shop in Mohali",
  //     shopDescription: "20% off on every purchase",
  //     location: "Chandigarh",
  //     contact: "Track Now",
  //     distance: "5KM",
  //     isFavorite: false,
  //   },
  //   {
  //     image: "/images/img4.jpg",
  //     shopName: "Anmol Cloth House",
  //     shopTitle: "Best Shop in Mohali",
  //     shopDescription: "20% off on every purchase",
  //     location: "Chandigarh",
  //     contact: "Track Now",
  //     distance: "2KM",
  //     isFavorite: false,
  //   },
  //   {
  //     image: "/images/img5.jpg",
  //     shopName: "Jeevan General Store",
  //     shopTitle: "Best Shop in Mohali",
  //     shopDescription: "20% off on every purchase",
  //     location: "Chandigarh",
  //     contact: "Track Now",
  //     distance: "7KM",
  //     isFavorite: false,
  //   },
  // ];
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (router.query.data) {
      setData(JSON.parse(decodeURIComponent(router.query.data as string)));
    }
  }, [router.query]);

  { JSON.stringify(data, null, 2) }

  

  const availableDays = shop?.closedDays || [];
  const daysOfWeek = [
    "Everyday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const closeTiming = shop?.closeTime;
  const OpenTiming = shop?.openTime;

  const currentLocation = data?.currentLocation;
  const paymentMethods = shop?.paymentMethods;
  const homeDeliveryValue = shop?.homeDelivery;


  const [isHomeDeliveryAvailable, setIsHomeDeliveryAvailable] = useState(homeDeliveryValue);
  const handleCallClick = () => {
    window.location.href = "tel:+1234567890"; // Replace with the appropriate phone number
  };
  useEffect(() => {
    if (typeof shop?.homeDelivery === "boolean") {
      setIsHomeDeliveryAvailable(shop.homeDelivery);
    }
  }, [shop?.homeDelivery]);
  const availablePaymentOptions = [
    { name: "Credit Cards", icon: "icon-credit-card-alt" },
    { name: "Debit Cards", icon: "icon-credit-card-alt" },
    { name: "Google Pay", icon: "icon-google" },
    { name: "Mobile Wallets", icon: "icon-wallet" },
    { name: "Cash On Delivery", icon: "icon-shop" },
  ];
  const methods = paymentMethods || [];


  const [images, setImages] = useState<string[]>([
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
    "/images/img8.jpg",
  ]);
  const removeImage = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to remove this image?");
    if (confirmed) {
      const updatedImages = images.filter((_, imgIndex) => imgIndex !== index);
      setImages(updatedImages);
    }
  };

  const tabs = [
    {
      label: <span>My Portfolio</span>, content:
        <>
          <div className={styles.imageSection}>
            <div className={styles.imagesCollage}>
              {images.map((imageSrc, index) => (
                <div className={styles.imgWrap} key={index}>
                  <img src={imageSrc} alt={`Property ${index + 1}`} />
                  <button className={styles.removeButton} onClick={() => removeImage(index)}>Delete</button>
                </div>
              ))}
            </div>

          </div>
        </>
    },
    {
      label: <span>Services or Products</span>, content:
        <div className={styles.personalInfo}>
          <div className={styles.description}>
          <ServiceList services={shop?.services} length={false} />
          </div>
          <div>
          </div>
        </div>
    },
    {
      label: <span>Payments Method</span>, content:
        <div className={styles.paymentMethod}>
          <h3>Payments Method</h3>
          <div className={styles.wrapper}>
          <ul>
            {availablePaymentOptions.map((option) => {
                if (methods.some((method) => method.trim().toLowerCase() === option.name.trim().toLowerCase())) {
                  return (
                    <li key={option.name}>
                      <span className={option.icon}></span> {option.name}
                    </li>
                  );
                }
                return null;
              })}
             </ul>
          </div>
        </div>
    },
    {
      label: <span>Shop Offers</span>, content:
        <>
          <UpdateDetail />
        </>
    },
  ];

  useEffect(() => {
    if (id) {
      const fetchData = async () => {
        try {
          const data = await fetchShopDetails(id as string); // Fetch shop details
          setShop(data);
        } catch (err) {
          setError(err.message || "An error occurred while fetching shop details");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <div className="container">
        <div className={styles.header}>
          {/* <span className={`${styles.iconShop} ${"icon-shop"}`}></span> */}
          <div className={styles.BoothShop}>
            <Image src="/images/VendorBhooth.png" alt="" width={400} height={200}></Image>
          </div>
          <div className={styles.wrapper}>
              <h1>{shop.businessName || "Shop Name is not provided buy seller"}</h1>
              <div className={styles.breadcrumbs}>
                <h4><span>GST NO:</span> {shop.gstNumber || "Not Provided"}</h4>
              </div>
          </div>
          <div className={styles.BoothShopNext}>
            <Image src="/images/VendorBhooth.png" alt="" width={400} height={200}></Image>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            <Tabs tabs={tabs}  />
            {/* <Commantbox ShopKeeper={ShopKeeperID} VisitedUserShop={VisitedUserShopID} /> */}
            {/* <OffersSectionProfile /> */}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            <div className={styles.detailsSection}>
              {/* Store Information */}
              <div className={styles.storeCard}>
                <div className={styles.focusedata}>
                  <Image src="/images/profile.png" width="100" height="100" alt="userProfile" />
                  <h3>{shop.fullName || "Not Provided"}</h3>
                  {/* <Link href="#">Edit Profile</Link> */}
                  <AverageRating shopKeeperID={ShopKeeperID} />

                  <div className={styles.subscribers}>
                    <p><span className="icon-group"></span>Subscribers: <span>25</span></p>
                    <p><span className="icon-eye"></span>views: <span>295</span></p>
                  </div>
                </div>
                <div className={styles.focusedata}>
                  <div className={styles.deliveryContainer}>
                    <div className={styles.deliveryCard}>
                      {isHomeDeliveryAvailable ? (
                        <div className="optionDeleviry">
                          <h2>
                            Available Home Delivery <span className="icon-ok-circled"></span>
                          </h2>
                          <p>
                            If you need something delivered to your doorstep, just give us a call, and we’ll handle the rest!
                          </p>
                          <button onClick={handleCallClick} className={styles.callButton}>
                            <span className="icon-phone"></span> Call Now
                          </button>
                        </div>
                      ) : (
                        <div className={styles.notDelivery}>
                          <h2>
                            No Home Delivery <span className="icon-cancel-squared"></span>
                          </h2>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.openingHours}>
                <div className={`${styles.hourseList} ${styles.openTiming}`}>
                  <table>
                    <thead>
                      <tr>
                        <th>Open Time</th>
                        <th>Close Time</th>
                      </tr>
                    </thead>
                    <tbody>
                          <tr>
                            <td>{OpenTiming ? `${OpenTiming} AM` : "...."}</td>
                            <td>{closeTiming ? `${closeTiming} PM` : "...."}</td>
                          </tr>
                    </tbody>
                  </table>
                </div>
                  <div className={styles.hourseList}>
                    <table>
                      <thead>
                        <tr>
                          <th>Day</th>
                          <th>Opening Hours</th>
                        </tr>
                      </thead>
                      <tbody>
                      {daysOfWeek.map((day) => {
                        const isDataAvailable = Array.isArray(availableDays);
                        const isClosed = isDataAvailable && availableDays.length > 0 ? availableDays.includes(day) : null;

                          return (
                            <tr key={day}>
                              <td>{day}</td>
                              <td
                                className={
                                  isClosed === null
                                    ? `${styles.textYellow}` // Styling for "Update Please"
                                    : isClosed
                                    ? `${styles.textRed}` // Styling for "Closed"
                                    : `${styles.textGreen}` // Styling for "Open"
                                }
                              >
                                {isClosed === null
                                  ? "...." // Show when data is missing or empty
                                  : isClosed
                                  ? "Closed" // Show when the shop is closed
                                  : "Open"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className={styles.personalDetails}>
                  <p><span className="icon-phone"> {shop.mobileNumber || "Not Provided"}</span></p>
                  <p><span className="icon-mail"> {shop.email || "Not Provided"}</span></p>
                </div>
                {/* <a href="#" className={styles.contactButton}>
                Message Store Owner
              </a> */}
              </div>
            </div>
            <div className={styles.sellerInfo}>
              <div className={styles.name}>Address</div>
              <div className={styles.address}>{shop.currentAddress || "Not Provided"}</div>
              <div className={styles.contact}>
                <Link href={shop.currentLocation || "null"} target="_blank">Track My Shop</Link>
                <Link href={currentLocation || ""} target="_blank">Share Profile</Link>
              </div>
              <div className={styles.shopID}><p><b>SHOP ID</b>: {shop._id || "Not Provided"}</p></div>
            </div>
          </div>
        </div>
      
        {/* Map Section */}
      </div>
    </>
  );
};

export default withProtectedPage(ShopProfile);
