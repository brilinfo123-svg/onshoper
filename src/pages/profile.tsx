"use client";

import { useSession } from "next-auth/react";
import { withProtectedPage } from "@/components/withProtectedPage";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import ProductPost from "@/components/ProductPost/Index";
import Tabs from "@/components/Tabs/Index";
import UpdateDetail from "@/components/UpdateDetail/Index";

import styles from "@/styles/Profile.module.scss";
import SkeletonCard from "@/components/SkeletonCard/Index";
import Button from "@/components/Button/Index";
import Swal from "sweetalert2";
import { signOut } from "next-auth/react";
import Head from "next/head";
import Loader from "@/components/loader/Index";

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
  // registration: any;
  shop: any;
  // favourites?: any;
}

const PropertyDetailPage: React.FC = () => {
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const shopOwnerID = shopData?.user?._id;

  console.log("shopData", shopData, "session", session);
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

    setLoading(true); // ✅ Start loader

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: session.user.contact }),
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Your account and products have been removed.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          signOut({ callbackUrl: "/login" });
        });
      } else {
        Swal.fire("Error", result.message || "Failed to delete account.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong.", "error");
    } finally {
      setLoading(false); // ✅ Stop loader
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

    setLoading(true); // ✅ Start loader

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
    } finally {
      setLoading(false); // ✅ Stop loader
    }
  };

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



  // useEffect(() => {
  //   fetch(`/api/getLocalShopById?id=${shop}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       setShop(data);
  //       setLoading(false);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching shop:", error);
  //       setLoading(false);
  //     });
  // }, []);

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

  console.log(shopData);

  // console.log("shopData Aakash:", shopData);
  // console.log("shopOwnerID:", shopOwnerID);

  // console.log("session", session);

  const tabs = [
    {
      label: <span className="icon-picture">My Ads</span>,
      content: <div className={styles.myAdss}>

        <div className={styles.makeProductFutured}>
          <h2>My Products</h2>
          <p>Listed Ads: <strong>{products.length}</strong></p>
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
            <div className={styles.productGridWrapper}>
              {/* 👆 Wrapper for products + upgrade button */}

              {/* ✅ Show Upgrade button only once at the top if any product is expired */}
              {products.some((p: any) => p.status === "expired") && (
                <div className={styles.upgradeTopWrapper}>
                  <Link href="/subscribePlan" className={styles.upgradeButton}>
                    Upgrade
                  </Link>
                </div>
              )}

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
                    priceWeek={product.priceWeek !== undefined ? Number(product.priceWeek) : undefined}
                    priceMonth={product.priceMonth !== undefined ? Number(product.priceMonth) : undefined}
                    coverImage={product.coverImage || product.images?.[0] || "/images/DefoultLogo.jpg"}
                    images={product.images || []}
                    createdAt={product.createdAt}
                    isFeatured={product.feature || false}
                    onDelete={handleDelete}
                    onUpdate={(id) => console.log("Update product", id)}
                    shopOwnerID={product.shopOwnerID}
                  />
                ))}
              </div>
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
        {loading && <Loader message="please wait..." />}
      </div>,
    },
    {
      label: <span className="icon-user">Update Profile</span>,
      content: <UpdateDetail />,
    },
  ];

  return (
    <div className="container">
      <Head>
        <title>My Profile – OnShoper</title>
        <meta name="description" content="View and manage your OnShoper profile. Track your listings, favorites, and account settings all in one place."/>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="UTF-8" />
      </Head>

      {/* <div className={styles.header}>
  {loading ? (
    <h1 className={styles.subscriptionTitle}>⏳ Loading subscription data...</h1>
  ) : shopData?.shopOwner ? (
    <>
      <h1 className={styles.subscriptionTitle}>
        🔔 Your Subscription Is About to Expire!
      </h1>

      <div className={styles.countdownTimer}>
        {timeLeft.expired ? (
          <span className={`${styles.timerText} ${styles.expired}`}>
            ⏳ Subscription expired!
          </span>
        ) : (
          <span className={`${styles.timerText} ${styles.active}`}>
            ⏳ {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
          </span>
        )}
      </div>
    </>
  ) : (
    <h1 className={styles.subscriptionTitle}>
      🚫 No Active Subscription Plan
    </h1>
  )}
</div> */}




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
