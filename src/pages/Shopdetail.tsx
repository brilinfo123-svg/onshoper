import StarRating from "@/components/StarRating/Index";
// import Commantbox from "@/components/ChatWindow/Index";
import styles from "@/styles/shopedetail.module.scss";
import ProductCard from "@/components/ProductCard/Index";
import ServiceList from "@/components/ServiceList/Index";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Tabs from "@/components/Tabs/Index";

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import OffersSection from "@/components/OffersSection/Index";
import SubscribeButton from "@/components/Subscribe/Index";

const PropertyDetailPage: React.FC = () => {
  // const { formData } = useFormData();


  const RegistredUser = [
    {
      "businessName": "A.K Sallun",
      "openTime": "09:30",
      "closeTime": "16:18",
      "flexibleTime": false,
      "mobileNumber": "8346387434",
      "email": "akash.verma@truinc.com",
      "fullName": "Aaksh Verma",
      "currentAddress": "mohali, Punjab, Chandigarh, Maloya",
      "currentLocation": "https://www.google.com/maps?q=30.6988678,76.6892068",
      "websiteLink": "http://localhost:3000/akash",
      "portfolioImages": [
          {},
          {},
          {},
          {}
      ],
      "services": [
          {
              "name": "Hear Cute",
              "price": "50",
              "discount": "0"
          },
          {
              "name": "Face Makup ",
              "price": "150",
              "discount": "0"
          },
          {
              "name": "Head Spa",
              "price": "200",
              "discount": "10"
          }
      ],
      "offers": [
          {
              "offerTitle": "Buy 1 Get 1 Free",
              "offerDescription": "This is Good Offer",
              "offerExpiry": "2024-12-25"
          },
          {
              "offerTitle": "Buy Up to 200 get cash back 50Rupay",
              "offerDescription": "This my newly offer",
              "offerExpiry": "2024-12-26"
          }
      ],
      "closedDays": [
          "Saturday",
          "Sunday"
      ],
      "category": "Home Services",
      "gstNumber": "GST123456",
      "homeDelivery": false,
      "profileImage": {},
      "paymentMethods": [
          "Cash on Delivery",
          "Debit Cards",
          "Google Pay",
          "Mobile Wallets"
      ]
  }
]



  const property = {
    title: "Hair Buzz Luxury Salon & Academy",
    breadcrumbs: ["24AAACC1206D1ZM"],
    date: "June 21, 2019 8:26 pm",
    location: "Port Chester, New York",
    price: "Services and Prices",
    description: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    seller: {
      name: "Address",
      address: "SCO 6, Mohali Airport Road, Sector 80, Sahibzada Ajit Singh Nagar, Punjab 140308, India",
      phone: "6735556XXXX",
    },
    mapLocation: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3021.918524!2d-73.67809!3d41.00149!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c2930c5c30a0ad%3A0xf9141d9cf7b3cbb6!2sPort%20Chester%2C%20NY%2010573%2C%20USA!5e0!3m2!1sen!2sin!4v1630484240914!5m2!1sen!2sin",
    details: `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Mi ipsum faucibus vitae aliquet. Velit sed ullamcorper morbi tincidunt ornare massa eget egestas.`,
    openingHours: {
      Sunday: "Closed",
      Monday: "1:00 PM - 1:00 PM",
      Tuesday: "1:00 PM - 1:00 PM",
      Wednesday: "Closed",
      Thursday: "Closed",
      Friday: "1:00 AM - 11:00 PM",
      Saturday: "Closed",
    },
  };
  const products = [
    {
      image: "/images/img1.jpg",
      shopName: "Ravi Halwai",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "2KM",
      isFavorite: false,
    },
    {
      image: "/images/img2.jpg",
      shopName: "Sundar Kirana Store",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase ",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "1.7KM",
      isFavorite: false,
    },
    {
      image: "/images/img2.jpg",
      shopName: "Sundar Kirana Store",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase ",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "1.7KM",
      isFavorite: false,
    },
    {
      image: "/images/img3.jpg",
      shopName: "Shakti Medical",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "5KM",
      isFavorite: false,
    },
    {
      image: "/images/img2.jpg",
      shopName: "Sundar Kirana Store",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase ",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "1.7KM",
      isFavorite: false,
    },
    {
      image: "/images/img4.jpg",
      shopName: "Anmol Cloth House",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "2KM",
      isFavorite: false,
    },
    {
      image: "/images/img5.jpg",
      shopName: "Jeevan General Store",
      shopTitle: "Best Shop in Mohali",
      shopDescription: "20% off on every purchase",
      location: "Chandigarh",
      contact: "Track Now",
      distance: "7KM",
      isFavorite: false,
    },
  ];
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (router.query.data) {
      setData(JSON.parse(decodeURIComponent(router.query.data as string)));
    }
  }, [router.query]);

  {JSON.stringify(data, null, 2)}

  const currentAddress = data?.currentAddress;
  const email = data?.email;
  const currentLocation = data?.currentLocation;
  const closeTime = data?.closeTime;
  const flexibleTime = data?.flexibleTime;
  const fullName = data?.fullName;
  const mobileNumber = data?.mobileNumber;
  const businessName = data?.businessName;
  const portfolioImages = data?.portfolioImages;

  
  

  const openTime = data?.openTime;
  const services = data?.services;
  const websiteLink = data?.websiteLink;

  const images = [
    "/images/img1.jpg",
    "/images/img2.jpg",
    "/images/img3.jpg",
    "/images/img4.jpg",
     "/images/img3.jpg",
    "/images/img4.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
    "/images/img5.jpg",
    "/images/img6.jpg",
    "/images/img7.jpg",
    "/images/img8.jpg",
  ];

  const tabs = [
    {
      label: <><span className="icon-picture">Portfolio</span></>, content:
        <>
        <div className={styles.imageSection}>
          <div className={styles.imagesCollage}>
            {images.map((imageSrc, index) => (
              <div className={styles.imgWrap} key={index}><img src={imageSrc} alt={`Property ${index + 1}`} /></div>
            ))}
          </div>
        </div>
        </>
    },
    {
      label: <><span className="icon-shop">Services</span></>, content:
        <>
        <div className={styles.personalInfo}>
          <div className={styles.description}>
            <ServiceList services={RegistredUser[0].services} length={false} />
          </div>
          <div>
          </div>
        </div>
        </>
    },
    {
      label: <><span className="icon-wallet">Payments Method</span></>, content:
        <>
         <div className={styles.paymentMethod}>
          <h3>Payments Method</h3>
          <div className={styles.wrapper}>
            <ul>
              <li><span className="icon-credit-card-alt"></span> Credit cards</li>
              <li><span className="icon-credit-card-alt"></span> Debit cards</li>
              <li><span className="icon-google"></span> Google Pay</li>
              <li><span className="icon-wallet"></span> Mobile Wallets</li>
              <li><span className="icon-shop"></span> Cash On Delivery</li>
            </ul>
          </div>
        </div>
        </>
    },
  ];

  
  const CardSlides = {
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    arrows: false,
    centerMode: true,  // Center the active slide
    centerPadding: '0',  // Avoid cutting off slides on both sides
    autoplay: true,
    speed: 1100, 
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1100,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  // const names = {
  //   deleviry: true,
  // };
  // const getDelivety = names?.deleviry;

const [isHomeDeliveryAvailable, setIsHomeDeliveryAvailable] = useState(RegistredUser[0].homeDelivery);
const handleCallClick = () => {
  window.location.href = "tel:+1234567890"; // Replace with the appropriate phone number
  
  console.log("Calling...");
};

  return (
    <div className="container">
      <pre></pre>
      {/* Header */}
      <div className={styles.header}>
      <div className={styles.SubscribeShop}>
        <SubscribeButton />
      </div>
      
        <h1><span className={`${styles.iconShop} ${"icon-shop"}`}></span> {RegistredUser[0].businessName || property.title}</h1>
        <div className={styles.breadcrumbs}>
        <h4><span>GST No:</span> {RegistredUser[0].gstNumber}</h4>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Left Column */}
        <div className={styles.leftColumn}>
          {/* Image Section */}
          <Tabs tabs={tabs} />
   
          <OffersSection />
          {/* Price Section */}
          {/* <div className={styles.realatedProduct}>
          <div className={styles.relHead}>
            <h3>Realated Shopes</h3>
          </div>
          <Slider {...CardSlides}>
              {products.map((product, index) => (
                <ProductCard allShopData={""} MyShopId={""} userShopId={""} offer={""} key={index} {...product} />
              ))}
          </Slider>
        </div> */}

          {/* <Commantbox/> */}
        </div>

        {/* Right Column */}
        <div className={styles.rightColumn}>
          <div className={styles.detailsSection}>
            {/* Store Information */}
            <div className={styles.storeCard}>
              <div className={styles.focusedata}>
                <Image src="/images/profile.png" width="100" height="100" alt="userProfile"/>
                
                <h3>{RegistredUser[0].fullName || "Gurmeet Kour"}</h3>
                
                <StarRating rating={4} />
                <Link href={RegistredUser[0].websiteLink || property.seller.phone}><p><span>🌐 Visit Website</span></p></Link>

              </div>
              <div className={styles.focusedata}>
                 <div className={styles.deliveryContainer}>
                      <div className={styles.deliveryCard}>
                      {isHomeDeliveryAvailable ? (
                            <div className="optionDeleviry">
                              <h2>Available Home Delivery <span className="icon-ok-circled"></span></h2>
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
             <div className={styles.hourseList}>
             <table>
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Opening Hours</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Sunday</td>
                        <td>Closed</td>
                    </tr>
                    <tr>
                        <td>Monday</td>
                        <td>1:00 PM - 1:00 PM</td>
                    </tr>
                    <tr>
                        <td>Tuesday</td>
                        <td>1:00 PM - 1:00 PM</td>
                    </tr>
                    <tr>
                        <td>Wednesday</td>
                        <td>Closed</td>
                    </tr>
                    <tr>
                        <td>Thursday</td>
                        <td>Closed</td>
                    </tr>
                    <tr>
                        <td>Friday</td>
                        <td>1:00 AM - 11:00 PM</td>
                    </tr>
                    <tr>
                        <td>Saturday</td>
                        <td>Closed</td>
                    </tr>
                </tbody>
            </table>
             </div>
              </div>
              <p><span>📞 {mobileNumber || property.seller.phone}</span></p>
              {/* <a href="#" className={styles.contactButton}>
                Message Store Owner
              </a> */}
            </div>
          </div>
          <div className={styles.sellerInfo}>
            <div className={styles.name}>{property.seller.name}</div>
            <div className={styles.address}>{RegistredUser[0].currentAddress || property.seller.address}</div>
            <div className={styles.contact}>
              <Link href={RegistredUser[0].currentLocation || "#"} target="_blank">Track Shope</Link>
              <Link href={`mailto:${RegistredUser[0].email}`}>Email to Seller</Link>
            </div>
          </div>
          <div className={styles.mapSection}>
            <h3>Location</h3>
            <iframe src={property.mapLocation} loading="lazy" title="Google Maps"></iframe>
          </div>
        </div>
      </div>

      {/* Map Section */}
       
    </div>
  );
};

export default PropertyDetailPage;




