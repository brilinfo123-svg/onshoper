"use client";

import { useSession } from "next-auth/react";
import { withProtectedPage } from "@/components/withProtectedPage";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductPost from "@/components/ProductPost/Index";
import FeatureButton from "@/components/FeaturedButton/Index";
import Tabs from "@/components/Tabs/Index";
import StarRating from "@/components/StarRating/Index";
import UpdateDetail from "@/components/UpdateDetail/Index";

import styles from "@/styles/Profile.module.scss";
import SkeletonCard from "@/components/SkeletonCard/Index";
import Button from "@/components/Button/Index";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";
import Head from "next/head";

interface ShopData {
  products(arg0: string, products: any): unknown;
  shopOwner: any;
  paidUntil: any;
  user: any;
  email: string;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: string;
  registration: any;
  shop: any;
  favourites?: any;
}

const PropertyDetailPage: React.FC = () => {
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const shopOwnerID = shopData?.user?._id;
  const [products, setProducts] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });
  const handleViewMore = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  console.log("wishlistProducts", wishlistProducts);
  // console.log(shopOwnerID);
  console.log("Sesstion Data", session)

  const handleDeleteAccount = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your account and all your products.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
  
    if (!confirm.isConfirmed) return;
  
    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
      });
  
      const result = await res.json();
  
      if (result.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Your account and products have been removed.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          signOut({ callbackUrl: "/" }); // ✅ logout after deletion
        });
      } else {
        Swal.fire("Error", result.message || "Failed to delete account.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  };

  const handleDelete = async (productId: string) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your ad.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });
  
    if (!confirm.isConfirmed) return;
  
    try {
      const res = await fetch(`/api/products/deleteProduct?id=${productId}`, {
        method: "DELETE",
      });
  
      if (res.ok) {
        setProducts((prev) => prev.filter((p: any) => p._id !== productId));
  
        Swal.fire({
          title: "Deleted!",
          text: "Your ad has been successfully removed.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to delete the ad. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      Swal.fire({
        title: "Error",
        text: "Something went wrong while deleting the ad.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!session?.user?.contact) return;

      try {
        const res = await fetch("/api/favorites/fetchFavoritesByShopOwner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: session.user.contact }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (res.ok) {
          setWishlistProducts(data.products || []);
        } else {
          console.error("Failed to fetch wishlist:", data.error || "Unknown error");
        }
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    };

    fetchWishlist();
  }, [session]);

  useEffect(() => {
    if (!shopOwnerID) return; // wait until shopOwnerID is available
    setLoading(true);
    fetch(`/api/products/getMyProducts?shopOwnerID=${shopOwnerID}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn("No products found or error:", data);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
        setLoading(false);
      });
  }, [shopOwnerID]); // re-run when shopOwnerID becomes available



  useEffect(() => {
    fetch(`/api/getLocalShopById?id=${shop}`)
      .then((response) => response.json())
      .then((data) => {
        setShop(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching shop:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (session?.user?.contact) {
      const fetchShopData = async () => {
        try {
          const response = await fetch(`/api/profile?userEmail=${session.user.contact}`);
          if (response.ok) {
            const data: ShopData = await response.json();
            setShopData(data);
          }
        } catch (error) {
          console.error("Error:", error);
        }
      };

      fetchShopData();
    }
  }, [session]);
  
  

  useEffect(() => {
    const paidUntil = shopData?.shopOwner?.paidUntil
      ? new Date(shopData.shopOwner.paidUntil)
      : null;
  
    if (!paidUntil) return;
  
    const updateCountdown = () => {
      const now = new Date();
      const timeDiff = paidUntil.getTime() - now.getTime();
  
      if (timeDiff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        return;
      }
  
      const totalSeconds = Math.floor(timeDiff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
  
      setTimeLeft({ days, hours, minutes, seconds, expired: false });
    };
  
    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();
  
    return () => clearInterval(timer);
  }, [shopData?.shopOwner?.paidUntil]);

  console.log("shopData Aakash:", shopData?.user);
  // console.log("session", session);

  const tabs = [
    {
      label: <span className="icon-picture">My Ads</span>,
      content: <>
        
        <div className={styles.makeProductFutured}>
          <h2>My Products</h2>
          {/* <Button className={`${styles["highlight-button"]} ${"icon-star"}`} href="/subscription" color="yellow" text="black" onClick={undefined}> Make Featured</Button> */}
        </div>
        {loading ? (
          <div className={styles.productGrid}>
            {[...Array(6)].map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={styles.notFoundShops}>
              <Image
                src="/icons/not-found.png"
                alt="not-found"
                width={200} // ✅ set your desired width
                height={200} // ✅ set your desired height
                priority // optional: load immediately
              />
              <p>No products Listed At</p>

              <Link href="/ProductForm" className={`${styles.sellAdd} ${"icon-shop"}`}> List Your Add</Link>
          </div>
        ) : (
          <>
            <div className={styles.productGrid}>
              {products.slice(0, visibleCount).map((product: any) => (
                <ProductPost
                  key={product._id}
                  _id={product._id}
                  title={product.title}
                  description={""}
                  category={product.category}
                  subCategory={product.subcategory}
                  price={Number(product.price)}
                  SalePrice={product.SalePrice}
                  priceWeek={
                    product.priceWeek !== undefined
                      ? Number(product.priceWeek)
                      : undefined
                  }
                  priceMonth={
                    product.priceMonth !== undefined
                      ? Number(product.priceMonth)
                      : undefined
                  }
                  coverImage={
                    product.coverImage || product.images?.[0] || "/images/img2.jpg"
                  }
                  images={product.images || []}
                  
                  createdAt={product.createdAt}
                  isFeatured={product.feature || false}
                  onDelete={handleDelete}
                  onUpdate={(id) => console.log("Update product", id)}
                  shopOwnerID={product.shopOwnerID}
                />
              ))}
            </div>

            {/* Show View More if more than 4 */}
            {visibleCount < products.length && (
              <div className={styles.viewMoreWrapper}>
                <Button className={styles["highlight-button"]} onClick={handleViewMore} color="black" text="white" href={""}                >
                  View More
                </Button>
              </div>
            )}
          </>
        )}

      </>,
    },
    // {
    //   label: <span className="icon-heart">Wishlist</span>,
    //   content: (
    //     <div className={styles.paymentMethod}>
    //       <h3>Favorite</h3>
    //       <div className={styles.productGrid}>
    //         {wishlistProducts.map((product) => (
    //           <ProductPost
    //             key={product._id}
    //             _id={product._id}
    //             title={product.title}
    //             description={""}
    //             category={product.category}
    //             subCategory={product.subcategory}
    //             price={Number(product.price)}
    //             priceWeek={product.priceWeek !== undefined ? Number(product.priceWeek) : undefined}
    //             priceMonth={product.priceMonth !== undefined ? Number(product.priceMonth) : undefined}
    //             SalePrice={product.SalePrice}
    //             coverImage={product.coverImage || product.images?.[0] || "/images/img2.jpg"}
    //             images={product.images || []}
    //             location={{
    //               city: product.location?.city || "",
    //               area: product.location?.area || "", 
    //               state: product.location?.state || ""
    //             }}
    //             createdAt={product.createdAt}
    //             isFeatured={product.featured || false}
    //             shopOwnerID={product.shopOwnerID}
    //           />
    //         ))}
    //       </div>
    //     </div>
    //   ),
    // },
    {
      label: <span className="icon-user">Update Profile</span>,
      content: <UpdateDetail />,
    },
  ];

  const businessName = shopData?.shop?.businessName;
  const GstNumber = shopData?.shop?.gstNumber;
  const currentAddress = shopData?.shop?.currentAddress;
  const currentLocation = shopData?.shop?.currentLocation;

  return (
    <div className="container">
     <Head>
        <title>My Profile – OnShoper</title>
        <meta
          name="description"
          content="View and manage your OnShoper profile. Track your listings, favorites, and account settings all in one place."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </Head>

      <div className={styles.header}>

      {shopData?.shopOwner?.paidUntil ? (
    <>
      <h1 className={styles.subscriptionTitle}>🔔 Your Subscription Is About to Expire!</h1>
          {shopData?.shopOwner?.paidUntil && (
            <div className={styles.countdownTimer}>
              {timeLeft.expired ? (
                <span className={`${styles.timerText} ${styles.expired}`}>Expired</span>
              ) : (
                <span className={`${styles.timerText} ${styles.active}`}>
                  ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
                </span>
              )}
            </div>
          )}
        </>
      ) : (
        <h1 className={styles.subscriptionTitle}>🚫 No Active Subscription Plan</h1>
      )}

        {/* <h1>🔔 Your Subscription Is About to Expire!</h1>
        {shopData?.shopOwner?.paidUntil && (
          <div className={styles.countdownTimer}>
            {timeLeft.expired ? (
              <span className={`${styles.timerText} ${styles.expired}`}>Expired</span>
            ) : (
              <span className={`${styles.timerText} ${styles.active}`}>
                ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s : left
              </span>
            )}
          </div>
        )} */}
      </div>

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <Tabs tabs={tabs} />
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.detailsSection}>
            <div className={styles.storeCard}>
              <div className={styles.focusedata}>
                <Image
                  src={shopData?.user?.photo || "/images/profile.png"}
                  width="100"
                  height="100"
                  alt="userProfile"
                />
                <h3>{shopData?.user?.name || "User"}</h3>
                {/* <StarRating rating={4} /> */}
                {/* <div className={styles.subscribers}>
                  <p>
                    <span className="icon-group"></span>Subscribers: <span>25</span>
                  </p>
                  <p>
                    <span className="icon-eye"></span>views: <span>295</span>
                  </p>
                </div> */}
              </div>
              <div className={styles.personalDetails}>
                <p>
                  <span className="icon-phone"> {shopData?.user?.contact || "N/A"}</span>
                </p>
                <p>
                  <span className="icon-mail"> {shopData?.user?.email || "N/A"}</span>
                </p>
              </div>
            </div>
          </div>
          <div className={styles.sellerInfo}>
            <div className={styles.shopID}>
              <p>
                <b>SHOP ID</b>: {shopData?.user?._id || "N/A"}
              </p>
            </div>
            <button onClick={handleDeleteAccount} className={styles.deleteBtn}>Delete Account</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withProtectedPage(PropertyDetailPage);
