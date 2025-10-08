import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import Link from "next/link";
import ChatBox from "@/components/ChatBox/Index";
import styles from "@/styles/ProductDetails.module.scss";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import Image from "next/image";
import { useSession } from "next-auth/react";
import StarRating from "@/components/StarRating/Index";
import Tabs from "@/components/Tabs/Index";
import ProductDetailsSkeleton from "@/components/ProductDetailsSkeleton/Index";
import ProfilePicSkeleton from "@/components/ProfilePicSkeleton/Index";
import useEmblaCarousel from 'embla-carousel-react';
import { useChat } from "@/contexts/ChatContext";
import Layout from "@/components/Layout/Index";
import useMediaQuery from "../../../hooks/useMediaQuery";
import Head from "next/head";

// import { WheelGesturesPlugin } from 'emb';



export function formatPostedTime(utcDate: string | Date) {

  const timeZone = "Asia/Kolkata";
  const zonedDate = toZonedTime(utcDate, timeZone);

  const time = format(zonedDate, "HH:mm");
  const relative = formatDistanceToNow(zonedDate, { addSuffix: true });

  return `Posted: ${relative}`;
}

const fetchShopDetails = async (id: string) => {
  const response = await fetch(`/api/products/${id}`);
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

const ProductDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [shop, setShop] = useState<any>(null); // State to store shop details
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { openChat } = useChat();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 992px)");
  const isDesckTop = useMediaQuery("(min-width: 992px)");
  // Google Maps configuration
  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  };

  const defaultCenter = {
    lat: 20.5937, // India coordinates
    lng: 78.9629
  };

  const SallerName = shopData?.user?.name;
  const SallerMobile = shopData?.user?.contact;
  const shopOwnerID = shopData?.user?.contact;


  console.log("session:", session);
  console.log("SallerName", SallerName);

  const [isHomeDeliveryAvailable, setIsHomeDeliveryAvailable] = useState(true);

  const startChat = () => {
    if (!session) {
      router.push('/login');
      return;
    }

    const useSidebarChat = true;

    if (useSidebarChat) {
      const coverImage = product?.coverImage || product?.images?.[0] || null;
      const otherUserName = SallerName;

      openChat(
        {
          id: shopOwnerID,
          name: otherUserName // ✅ seller name
        },
        {
          id: product._id,
          title: product.title,
          coverImage: coverImage || product.images?.[0] || null,
          otherUserName: SallerName
        }
      );
    } else {
      router.push({
        pathname: `/chat/${product.shopOwnerID}`,
        query: {
          sellerName: SallerName,
          productId: product._id,
          productTitle: product.title
        }
      });
    }
  };



  const handleCallClick = () => {
    if (SallerMobile) {
      const cleanNumber = SallerMobile.replace(/\D/g, '');
      window.location.href = `tel:${cleanNumber}`;
    } else {
      alert('Mobile number not available');
    }
  };

  // Function to handle WhatsApp click
  const handleWhatsAppClick = () => {
    if (SallerMobile) {
      const cleanNumber = SallerMobile.replace(/\D/g, '');
      let whatsappNumber = cleanNumber;

      // Add country code if missing (assuming India +91)
      if (!whatsappNumber.startsWith('91') && whatsappNumber.length === 10) {
        whatsappNumber = `91${whatsappNumber}`;
      }

      window.open(`https://wa.me/${whatsappNumber}`, '_blank');
    } else {
      alert('Mobile number not available');
    }
  };

  // const startChat = () => {
  //   if (!session) {
  //     router.push('/login');
  //     return;
  //   }
  //   // URL parameters ke through extra data send karo
  //   router.push({
  //     pathname: `/chat/${product.shopOwnerID}`,
  //     query: {
  //       sellerName: SallerName,
  //       productId: product._id,
  //       productTitle: product.title
  //     }
  //   });
  // };


  // console.log("currentUserId:", session?.user?.id);
  // console.log("otherUserId:", product?.shopOwnerID);

  const hideSubcategories = [
    "Bicycles",
    "DJ & Sound Systems",
    "Spare Parts",
  ];

  const hideCategories = [
    "Mobiles",
    "Events & Entertainment",
    "Education & Learning",
    "Tools & Equipment",
    "Pets & Pet Care",
    "Jobs",
    "Services",
    "Books, Sports & Hobbies",
    "Fashion",
    "Furniture",
    "Electronics & Appliances",
    "Real Estate",
  ];


  const shouldHide = hideSubcategories.includes(product?.subcategory) || hideCategories.includes(product?.category);

  // useEffect(() => {
  //   if (typeof shop?.homeDelivery === "boolean") {
  //     setIsHomeDeliveryAvailable(shop.homeDelivery);
  //   }
  // }, [shop?.homeDelivery]);



  useEffect(() => {
    const fetchProductAndSeller = async () => {
      if (!id) return;

      try {
        const productRes = await fetch(`/api/products/${id}`);
        const productData = await productRes.json();
        const productDetails = productData.product;

        setProduct(productDetails);

        if (productDetails?.ownerEmail) {
          const sellerRes = await fetch(`/api/profile?userEmail=${productDetails.ownerEmail}`);
          if (sellerRes.ok) {
            const sellerData = await sellerRes.json();
            setShopData(sellerData);
            setSeller(sellerData); // optional
          } else {
            console.error("⚠️ Failed to fetch seller data");
          }
        }
      } catch (err) {
        console.error("❌ Error fetching product or seller:", err);
      }
    };

    fetchProductAndSeller();
  }, [id]);


  // Embla Carousel hooks
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: currentImageIndex,
    loop: true
  },);

  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  // ... (rest of your existing code remains the same)

  // Function to open image modal
  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // Function to close image modal
  const closeImageModal = useCallback(() => {
    setShowImageModal(false);
  }, []);

  // Scroll to specific slide
  const scrollTo = useCallback((index: number) => {
    if (emblaApi) emblaApi.scrollTo(index);
  }, [emblaApi]);

  // Navigate to next slide
  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // Navigate to previous slide
  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  // Update button states and selected index
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  // Initialize Embla and get scroll snap points
  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Set initial slide when modal opens
  useEffect(() => {
    if (emblaApi && showImageModal) {
      emblaApi.scrollTo(currentImageIndex);
    }
  }, [emblaApi, showImageModal, currentImageIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showImageModal) return;

      if (e.key === 'Escape') {
        closeImageModal();
      } else if (e.key === 'ArrowRight') {
        scrollNext();
      } else if (e.key === 'ArrowLeft') {
        scrollPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, scrollNext, scrollPrev, closeImageModal]);


  if (!product) return <ProductDetailsSkeleton />;

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    arrow: true,
    slidesToScroll: 1,
    className: styles.slider,
  };

  // const tabs = [
  //   {
  //     label: <span className="icon-picture">My Portfolio</span>, content:
  //       <>
  //         ``
  //       </>
  //   },
  //   {
  //     label: <span className="icon-cog">My Services</span>, content:
  //       <div className={styles.personalInfo}>
  //         dced
  //         <div>
  //         </div>
  //       </div>
  //   },
  //   {
  //     label: <span className="icon-wallet">Payments Method</span>, content:
  //       <div className={styles.paymentMethod}>
  //         <h3>Payments Method</h3>

  //       </div>
  //   },
  // ];

  return (
    <div className="container">
      <Head>
        <title>{product.title} – OnShoper</title>
        <meta
          name="description"
          content={`Find ${product.title} for ${product.SaleType || "Rent/Sale"} on OnShoper. ${product.description.slice(0, 150)}...`}
        />
      </Head>
      {/* {shopData ? (
        <div>
          <h2>Shop Details:</h2>
          <p>Name: {shopData?.shop?.fullName || "Not Provided"}</p>
          <p>Email: {shopData?.shop?.email}</p>
          <p>Address: {shopData?.shop?.address || "N/A"}</p>

          <h2>Registration Details:</h2>
          <p>Registration ID: {shopData?.registration?.id}</p>
          <p>Registered At: {shopData?.registration?.createdAt}</p>
          <p>User Name: {shopData?.registration?.fullName}</p>
        </div>
      ) : (
        <p>Loading...</p>
      )} */}
      {/* <div className={styles.header}>
          <h1>
            <span className={`${styles.iconShop} icon-shop`}></span>
            businessName
          </h1>
          <div className={styles.breadcrumbs}>
            <h4>
              <span>GST NO:</span>
            </h4>
          </div>
        </div> */}
      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {product.images?.length > 1 ? (
            <Slider {...sliderSettings}>
              {product.images.map((img: string, index: number) => (
                <div
                  key={index}
                  className={styles.slide}
                  onClick={() => openImageModal(index)}
                >
                  <Image
                    src={img || "/images/watercolor.png"} // fallback for broken image
                    alt={`product-${index}`}
                    width={600}
                    height={400}
                    style={{ objectFit: "contain", width: "100%", height: "100%", cursor: "pointer" }}
                  />
                </div>
              ))}
            </Slider>
          ) : product.images?.length === 1 ? (
            <div
              className={styles.slide}
              onClick={() => openImageModal(0)}
            >
              <Image
                src={product.images[0] || "/images/watercolor.png"} // fallback for single image
                alt="product-single"
                width={600}
                height={400}
                style={{ objectFit: "contain", width: "100%", height: "100%", cursor: "pointer" }}
              />
            </div>
          ) : (
            <div className={styles.slide}>
              <Image
                src={product.coverImage?.trim() ? product.coverImage : "/images/watercolor.png"} // ✅ fallback if coverImage is empty or missing
                alt="default"
                width={600}
                height={400}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </div>
          )}


          {/* Image Modal with Embla Carousel */}
          {showImageModal && (
            <div className={styles.imageModal} onClick={closeImageModal}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={closeImageModal}>
                  &times;
                </button>

                <div className={styles.embla}>
                  <div className={styles.embla__viewport} ref={emblaRef}>
                    <div className={styles.embla__container}>
                      {product.images.map((img: string, index: number) => (
                        <div className={styles.embla__slide} key={index}>
                          <div className={styles.embla__slide__inner}>
                            <Image
                              src={img}
                              alt={`product-${index}`}
                              fill
                              style={{ objectFit: "contain" }}
                              priority={index === currentImageIndex}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {product.images.length > 1 && (
                    <>
                      <button
                        className={`${styles.embla__button} ${styles.embla__button__prev}`}
                        onClick={scrollPrev}
                        disabled={!prevBtnEnabled}
                      >
                        <svg className={styles.embla__button__svg} viewBox="0 0 532 532">
                          <path fill="currentColor" d="M355.66 11.354c13.793-13.805 36.208-13.805 50.001 0 13.785 13.804 13.785 36.238 0 50.034L201.22 266l204.442 204.61c13.785 13.805 13.785 36.239 0 50.044-13.793 13.796-36.208 13.796-50.002 0a5994246.277 5994246.277 0 0 0-229.332-229.454 35.065 35.065 0 0 1-10.326-25.126c0-9.2 3.393-18.26 10.326-25.2C172.192 194.973 332.731 34.31 355.66 11.354Z" />
                        </svg>
                      </button>

                      <button
                        className={`${styles.embla__button} ${styles.embla__button__next}`}
                        onClick={scrollNext}
                        disabled={!nextBtnEnabled}
                      >
                        <svg className={styles.embla__button__svg} viewBox="0 0 532 532">
                          <path fill="currentColor" d="M176.34 520.646c-13.793 13.805-36.208 13.805-50.001 0-13.785-13.804-13.785-36.238 0-50.034L330.78 266 126.34 61.391c-13.785-13.805-13.785-36.239 0-50.044 13.793-13.796 36.208-13.796 50.002 0 22.928 22.947 206.395 206.507 229.332 229.454a35.065 35.065 0 0 1 10.326 25.126c0 9.2-3.393 18.26-10.326 25.2-45.865 45.901-206.404 206.564-229.332 229.52Z" />
                        </svg>
                      </button>

                      <div className={styles.embla__dots}>
                        {scrollSnaps.map((_, index) => (
                          <button
                            key={index}
                            className={`${styles.embla__dot} ${index === selectedIndex ? styles.embla__dot__selected : ''}`}
                            type="button"
                            onClick={() => scrollTo(index)}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className={styles.imageCounter}>
                    {selectedIndex + 1} / {product.images.length}
                  </div>
                </div>
              </div>
            </div>
          )}




          {/* <Tabs tabs={tabs} /> */}
          {/* <OffersSectionProfile /> */}
          {/* <div className={styles.details}>
            <h1>{product.title}</h1>
            <p><strong>Description:</strong> {product.description}</p>
            <p><strong>Category:</strong> {product.category}</p>
            {product.subCategory && <p><strong>Sub-category:</strong> {product.subCategory}</p>}
            {product.location && <p><strong>Location:</strong> {product.location}</p>}

            <div className={styles.pricing}>
              <p><strong>Price/Day:</strong> ₹{product.price}</p>
              {product.priceWeek && <p><strong>Price/Week:</strong> ₹{product.priceWeek}</p>}
              {product.priceMonth && <p><strong>Price/Month:</strong> ₹{product.priceMonth}</p>}
            </div>
          </div>

          {product.rentalTermsFile && (
            <div className={styles.termFile}>
              <h3>Rental Terms & Conditions</h3>
              <Link href={product.rentalTermsFile} target="_blank" rel="noopener noreferrer">View / Download Terms PDF</Link>
            </div>
          )} */}


          <div className={styles.details}>
            {/* Header */}
            <div className={styles.header}>
              <span className={styles.category}>
                {product.category} → {product.subcategory}
              </span>
            </div>

            {/* Vehicle Info */}
            <section className={styles.card}>
              <h2>{product.title}</h2>
              {isMobile && 
                  <section className={`${styles.card} ${styles.priceCard} ${styles.forMobile}`}>
                    <h2 className="icon-tag-1">Price</h2>
                        {product?.category === "Jobs" ? (
                          <div className={styles.salarySection}>
                            <div className={`${styles.salaryCard} ${styles.to}`}>
                              <div className={styles.iconWrapper}>
                                <i className="icon-down-open-mini"></i>
                              </div>
                              <div className={styles.textWrapper}>
                                <span className={styles.label}>Salary From</span>
                                <span className={styles.amount}>₹{product?.salaryFrom || "N/A"}</span>
                              </div>
                            </div>
                            <div className={`${styles.salaryCard} ${styles.from}`}>
                              <div className={styles.iconWrapper}>
                                <i className="icon-up-open-mini"></i>
                              </div>
                              <div className={styles.textWrapper}>
                                <span className={styles.label}>Salary To</span>
                                <span className={styles.amount}>₹{product?.salaryTo || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          ) : product.SaleType === "Sale" ? (
                            <p className={styles.SalePrice}>{product.SalePrice}</p>
                          ) : (
                            <div className={styles.rentPrices}>
                              {product.priceMonth ? (
                                <div className={`${styles.priceBox} ${styles.active}`}>
                                  <div className={styles.wrap}>
                                  <i className="icon-calendar"></i>
                                  <span className={styles.duration}>Monthly</span>
                                  </div>
                                  <span className={styles.amount}>₹{product.priceMonth}</span>
                                </div>
                              ) : (
                                <>
                                  {product.priceWeek && (
                                    <div className={`${styles.priceBox} ${styles.active}`}>
                                      <div className={styles.wrap}>
                                      <i className="icon-calendar"></i>
                                      <span className={styles.duration}>Weekly</span>
                                      </div>
                                      <span className={styles.amount}>₹{product.priceWeek}</span>
                                    </div>
                                  )}
                                  {product.price && (
                                    <div className={`${styles.priceBox} ${styles.active}`}>
                                      <div className={styles.wrap}>
                                      <i className="icon-calendar"></i>
                                      <span className={styles.duration}>Per Day</span>
                                      </div>
                                      <span className={styles.amount}>₹{product.price}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                  </section>
              }
              <div className={styles.formRow}>
                <div className={styles.labelCol}>
                  <ul className={styles.infoList}>
                    {!(
                      ["Education & Learning", "Pets & Pet Care", "Tools & Equipment", "Jobs", "Events & Entertainment", "Services", "Books, Sports & Hobbies", "Fashion", "Furniture", "Electronics & Appliances", "Real Estate"].includes(product?.category) ||
                      ["Tablets", "Spare Parts"].includes(product?.subcategory)
                    ) && (
                        <li><strong className="icon-tag-1"> Brand:</strong> {product?.commercialBrand || product?.brand || product?.BicyclesBrand || product?.MobileBrand || product?.MobileModel || product?.TabsType || product?.carBrand || "..."}</li>
                      )}
                    {product?.MobileModel && (
                      <li>
                        <strong className="icon-mobile"> Model:</strong> {product.MobileModel}
                      </li>
                    )}
                    {!shouldHide && (
                      <>
                        <li><strong className="icon-barcode"> Model:</strong> {product?.commercialModel || product?.model || product?.carModel || "..."}</li>
                        <li><strong className="icon-calendar"> Year:</strong> {product?.year ? product?.year : "..."}</li>
                      </>
                    )}
                    {product?.subcategory === "Spare Parts" && (
                      <>
                        <li><strong className="icon-cog"> Part Type:</strong> {product?.SpareParts || "..."}</li>
                      </>
                    )}

                    {product?.subcategory === "Tablets" && (
                      <>
                        <li><strong className="icon-tablet"> Tab Type:</strong> {product?.TabsType || "..."}</li>
                      </>
                    )}
                    {!["Jobs", "Pets & Pet Care", "Events & Entertainment", "Education & Learning", "Services", "Real Estate"].includes(product?.category) && (
                      <li><strong className="icon-search"> Condition:</strong> <div className={styles.futureResult}>
                        {["New", "Good", "Fair"].map((label, idx) => {
                          let conditionClass = styles.inactive;

                          if (product.condition === label) {
                            if (label === "New") conditionClass = styles.new;
                            if (label === "Good") conditionClass = styles.good;
                            if (label === "Fair") conditionClass = styles.fair;
                          }

                          return (
                            <span key={idx} className={conditionClass}>
                              {product.condition === label && <i className="icon-ok-1"></i>} {label}
                            </span>
                          );
                        })}
                      </div>
                      </li>
                    )}

                    {!shouldHide && (
                      <>
                        <li><strong className="icon-fuel"> Fuel:</strong> {product.fuel ? product.fuel : "..."}</li>
                        {product.subcategory !== "Motorcycles" && (<li> <strong className="icon-cog"> Transmission:</strong> {product.transmission || "..."}</li>)}
                        <li><strong className="icon-road"> KM Driven:</strong> {" "} {product.KmDriven ? product.KmDriven : "..."}</li>
                        <li><strong className="icon-user-1"> Owners:</strong>{" "}{product.OwnersNo ? product.OwnersNo : "..."}</li>
                      </>
                    )}
                    {product?.category === "Jobs" && (
                      <>
                        <li><strong className="icon-info-circled"> Job Title:</strong> {product?.title || "..."}</li>
                        <li><strong className="icon-briefcase"> Position Type:</strong> {product?.positionType || "..."}</li>
                        <li><strong className="icon-calendar"> Salary Period:</strong>{product?.salaryPeriod || "..."}</li>
                        <li><strong className="icon-calendar"> Salary:</strong> {product?.salaryFrom || "..."} - {product?.salaryTo || "..."}</li>
                      </>
                    )}

                    {product?.subcategory === "House & Apartments" && (
                      <>
                        <li><strong> Type:</strong> {product?.apartmentType || "..."}</li>
                        <li><strong> BHK:</strong> {product?.bhk || "..."}</li>
                        <li><strong> Bathrooms:</strong>{product?.bathrooms || "..."}</li>
                        <li><strong> Car Parking:</strong> {product?.carParking || "..."}</li>
                        <li><strong> Total Floors:</strong> {product?.totalFloors || "..."}</li>
                        <li><strong> Floor No:</strong> {product?.floorNo || "..."}</li>
                        <li><strong> super Built-up Area :</strong> {product?.superBuiltupArea || "..."}</li>
                        <li><strong> Carpet Area :</strong> {product?.carpetArea || "..."}</li>
                        <li><strong> Facing:</strong> {product?.facing || "..."}</li>
                        <li><strong> Furnishing:</strong> {product?.furnishing || "..."}</li>
                        <li><strong> Maintenance:</strong> {product?.maintenance || "..."}</li>
                        <li><strong> Construction Status:</strong> {product?.ConstructionStatus || "..."}</li>
                        <li><strong> Project Name:</strong> {product?.projectName || "..."}</li>
                        <li><strong> Listed By:</strong> {product?.listedBy || "..."}</li>
                      </>
                    )}

                    {["Land & Plots"].includes(product?.subcategory) && (
                      <>

                        <li><strong> Type:</strong> For {product?.SaleType || "..."}</li>
                        <li><strong> Facing:</strong> {product?.facing || "..."}</li>
                        <li><strong> Land Breadth:</strong> {product?.landBreadth || "..."}</li>
                        <li><strong> Land Length:</strong> {product?.landLength || "..."}</li>
                        <li><strong> Plot Area:</strong> {product?.landPlotArea || "..."}</li>
                        <li><strong> Project Name:</strong> {product?.projectName || "..."}</li>
                        <li><strong> Listed By:</strong> {product?.listedBy || "..."}</li>
                      </>
                    )}

                    {["Commercial Properties"].includes(product?.subcategory) && (
                      <>
                        <li><strong> Type:</strong> For {product?.SaleType || "..."}</li>
                        <li><strong> Property Type:</strong> {product?.CommercialSubtype || "..."}</li>
                        <li><strong> Furnishing:</strong> {product?.furnishing || "..."}</li>
                        <li><strong> Car Parking:</strong> {product?.carParking || "..."}</li>
                        <li><strong> Carpet Area :</strong> {product?.carpetArea || "..."}</li>
                        <li><strong> super Built-up Area :</strong> {product?.superBuiltupArea || "..."}</li>
                        <li><strong> Maintenance:</strong> {product?.maintenance || "..."}</li>
                        <li><strong> Construction Status:</strong> {product?.ConstructionStatus || "..."}</li>
                        <li><strong> Project Name:</strong> {product?.projectName || "..."}</li>
                        <li><strong> Listed By:</strong> {product?.listedBy || "..."}</li>
                      </>
                    )}
                    {["PG & Guest House"].includes(product?.subcategory) && (
                      <>
                        <li><strong> Type:</strong> For {product?.SaleType || "..."}</li>
                        <li><strong> Property Type:</strong> {product?.pgSubtype || "..."}</li>
                        <li><strong> Bachelors Allowed:</strong> {product?.bachelorsAllowed || "..."}</li>
                        <li><strong> Meals Included:</strong> {product?.mealsIncluded || "..."}</li>
                        <li><strong> Furnishing:</strong> {product?.furnishing || "..."}</li>
                        <li><strong> Car Parking:</strong> {product?.carParking || "..."}</li>
                        <li><strong> Listed By:</strong> {product?.listedBy || "..."}</li>
                      </>
                    )}
                    {product?.subcategory === "Shops & Offices" && (
                      <>
                        <li><strong> Type:</strong> {product?.SaleType || "..."}</li>
                        <li><strong> Car Parking:</strong> {product?.carParking || "..."}</li>
                        <li><strong> Carpet Area :</strong> {product?.carpetArea || "..."}</li>
                        <li><strong> super Built-up Area :</strong> {product?.superBuiltupArea || "..."}</li>
                        <li><strong> Furnishing:</strong> {product?.furnishing || "..."}</li>
                        <li><strong> Maintenance:</strong> {product?.maintenance || "..."}</li>
                        <li><strong> Construction Status:</strong> {product?.ConstructionStatus || "..."}</li>
                        <li><strong> Project Name:</strong> {product?.projectName || "..."}</li>
                        <li><strong> Listed By:</strong> {product?.listedBy || "..."}</li>
                      </>
                    )}


                  </ul>

                  {/* Description */}
                  <section className={styles.DescriptionCard}>
                    <h2>Description</h2>
                    <p>{product.description}</p>
                  </section>
                </div>
               
                <div className={styles.PeriveAddress}>
                {isDesckTop &&
                  <section className={`${styles.card} ${styles.priceCard}`}>
                    <h2 className="icon-tag-1">Price</h2>
                        {product?.category === "Jobs" ? (
                          <div className={styles.salarySection}>
                            <div className={`${styles.salaryCard} ${styles.to}`}>
                              <div className={styles.iconWrapper}>
                                <i className="icon-down-open-mini"></i>
                              </div>
                              <div className={styles.textWrapper}>
                                <span className={styles.label}>Salary From</span>
                                <span className={styles.amount}>₹{product?.salaryFrom || "N/A"}</span>
                              </div>
                            </div>
                            <div className={`${styles.salaryCard} ${styles.from}`}>
                              <div className={styles.iconWrapper}>
                                <i className="icon-up-open-mini"></i>
                              </div>
                              <div className={styles.textWrapper}>
                                <span className={styles.label}>Salary To</span>
                                <span className={styles.amount}>₹{product?.salaryTo || "N/A"}</span>
                              </div>
                            </div>
                          </div>
                          ) : product.SaleType === "Sale" ? (
                            <p className={styles.SalePrice}>{product.SalePrice}</p>
                          ) : (
                            <div className={styles.rentPrices}>
                              {product.priceMonth ? (
                                <div className={`${styles.priceBox} ${styles.active}`}>
                                  <div className={styles.wrap}>
                                  <i className="icon-calendar"></i>
                                  <span className={styles.duration}>Monthly</span>
                                  </div>
                                  <span className={styles.amount}>₹{product.priceMonth}</span>
                                </div>
                              ) : (
                                <>
                                  {product.priceWeek && (
                                    <div className={`${styles.priceBox} ${styles.active}`}>
                                      <div className={styles.wrap}>
                                      <i className="icon-calendar"></i>
                                      <span className={styles.duration}>Weekly</span>
                                      </div>
                                      <span className={styles.amount}>₹{product.priceWeek}</span>
                                    </div>
                                  )}
                                  {product.price && (
                                    <div className={`${styles.priceBox} ${styles.active}`}>
                                      <div className={styles.wrap}>
                                      <i className="icon-calendar"></i>
                                      <span className={styles.duration}>Per Day</span>
                                      </div>
                                      <span className={styles.amount}>₹{product.price}</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          )}

                  </section>
                  }
                  {/* Social Media Section */}
                  <div className={styles.socialMedia}>
                    <div className={styles.socialLinks}>
                      {product.facebook && <a href={product.facebook} target="_blank" rel="noopener noreferrer"><span className="icon-facebook"></span>Facebook</a>}
                      {product.instagram && <a href={product.instagram} target="_blank" rel="noopener noreferrer"><span className="icon-instagram"></span>Instagram</a>}
                      {product.twitter && <a href={product.twitter} target="_blank" rel="noopener noreferrer"><span className="icon-twitter-circled"></span>Twitter</a>}
                    </div>
                  </div>
                </div>
               
              </div>

            </section>
          </div>
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <div className={styles.detailsSection}>
            {/* Store Information */}
            <div className={styles.storeCard}>
              <div className={styles.focusedata}>
                {shopData ? (
                  <>
                    <Image src={shopData?.user?.photo || "/images/profile.png"} width="100" height="100" alt="userProfile" />
                    <h3>{shopData.user?.name || "Add Name"}</h3>
                  </>
                ) : (
                  <ProfilePicSkeleton size="xlarge"
                    withText={true} />
                )}
                {/* <StarRating rating={4} /> */}

                <div className={styles.subscribers}>

                  <div className={styles.contactButtons}>
                    <button onClick={startChat} className="icon-comment"></button>
                    <button onClick={handleCallClick} className="icon-phone"></button>
                    <button onClick={handleWhatsAppClick} className="icon-whatsapp"></button>
                  </div>
                  {/* <p><span className="icon-group"></span>Subscribers: <span>25</span></p>
                  <p><span className="icon-eye"></span>views: <span>295</span></p> */}
                </div>
              </div>

              <div className={styles.personalDetails}>
                {/* <p>{shopData ? (<span className="icon-phone"> {shopData.registration?.mobile || "Gurmeet Kour"}</span>) : (<span>Loading...</span>)}</p> */}
                {shopData ? (
                  <>
                    <p>{shopData ? (<span className="icon-mail"> {shopData.user?.email || "Add Email"}</span>) : (<span>Loading...</span>)}</p>
                  </>
                ) : (
                  <ProfilePicSkeleton size="xlarge" showCircle={false}
                    withText={true} />
                )}


              </div>
              {/* <a href="#" className={styles.contactButton}>
                Message Store Owner
              </a> */}
            </div>
          </div>
          {/* <div className={styles.focusedata}>
            <div className={styles.deliveryContainer}>
              <div className={styles.deliveryCard}>
                {product.pickupOption === "owner" ? (
                  <div className="optionDeleviry">
                    <h2>Available Home Delivery <span className="icon-ok-circled"></span></h2>
                    <p>If you need something delivered to your doorstep, just give us a call, and we’ll handle the rest!</p>
                    <button onClick={handleCallClick} className={styles.callButton}>
                      <span className="icon-phone"></span> Call Now
                    </button>
                  </div>
                ) : product.pickupOption === "customer" ? (
                  <div className={styles.notDelivery}>
                    <h2>Only Customer Pickup <span className="icon-cancel-squared"></span></h2>
                    <p>Please visit the owner's location to collect the product.</p>
                  </div>
                ) : (
                  <div className={styles.notDelivery}>
                    <h2>Delivery Option Not Provided <span className="icon-help-circled"></span></h2>
                  </div>
                )}
              </div>
            </div>
          </div> */}

          <div className={styles.sellerInfo}>
            <div className={styles.name}>Address</div>
            <div className={styles.address}>
              {/* {product.location} || {product.location} */}
              <p>{product?.location?.city || "Null"} {">"} {product?.location?.area || "Null"}</p>
            </div>
            <div className={styles.shopID}><p><b>ID</b>: {product?._id || "Gurmeet Kour"}</p></div>
          </div>
          {/* Terms */}
          {product.termsAccepted && (
            product.rentalTermsFile ? (
              <Link
                href={product.rentalTermsFile}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className={`${styles.card} ${styles.terms}`}>
                  View / Download Terms PDF
                </div>
              </Link>
            ) : (
              <div className={`${styles.card} ${styles.noTerms}`}>
                No Any Terms
              </div>
            )
          )}


          <div className="location-section">
            {product.location && product.location.coordinates ? (
              <>
                {/* Normal Google Map Embed without API */}
                <div className="map-container">
                  {/* <h4>Location Map</h4>
                   */}
                  <div className="map-wrapper">
                    <iframe
                      width="100%"
                      height="250"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${product.location.coordinates.lat},${product.location.coordinates.lng}&zoom=15&maptype=roadmap`}
                      allowFullScreen
                      title="Product location map"
                      loading="lazy"
                    />
                  </div>

                  {/* <div className="map-details">
                    <p className="coordinates">
                      <strong>Coordinates:</strong> 
                      {product.location.coordinates.lat.toFixed(6)}°N, 
                      {product.location.coordinates.lng.toFixed(6)}°E
                    </p>
                    <a 
                      href={`https://www.google.com/maps?q=${product.location.coordinates.lat},${product.location.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="map-link"
                    >
                      📍 Open in Google Maps
                    </a>
                  </div> */}
                </div>
              </>
            ) : (
              <p className="no-location">Location information not available</p>
            )}
          </div>

        </div>
      </div>
      {/* <button onClick={startChat} className={styles.chatButton}>
        Chat with Seller
      </button> */}

      {/* Map Section */}
      <Layout hideOnOverlayClick={true} children={undefined} >
        {/* Your page content */}
      </Layout>
    </div>
  );
};

export default ProductDetails;
