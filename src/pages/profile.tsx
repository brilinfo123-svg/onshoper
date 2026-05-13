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
  shop: any;
}

const PropertyDetailPage: React.FC = () => {
  const { data: session } = useSession();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const rentProducts = products.filter((p: any) => p.SaleType === "Rent");
  const saleProducts = products.filter((p: any) => p.SaleType === "Sale");
  const soldProducts = products.filter((p: any) => p.status === "sold");
  const [activeTab, setActiveTab] = useState("rent");
  
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 767);
  };

  handleResize();

  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

  console.log(shopData);
  // ✅ Alag-alag loading states
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // delete account / delete ad

  const [visibleCount, setVisibleCount] = useState(3);
  const router = useRouter();

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

    setActionLoading(true);

    try {
      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact: session?.user?.contact }),
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
      setActionLoading(false);
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

    setActionLoading(true);

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
      setActionLoading(false);
    }
  };
  const handleMarkSold = async (productId: string) => {
    const confirm = await Swal.fire({
      title: "Mark as Sold?",
      text: "This product will be moved to Sold section.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, mark it",
      cancelButtonText: "Cancel",
    });
  
    if (!confirm.isConfirmed) return;
  
    setActionLoading(true);
  
    try {
      const res = await fetch(`/api/products/markSold?id=${productId}`, {
        method: "PUT",
      });
  
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) =>
            item._id === productId
              ? { ...item, status: "sold" }
              : item
          )
        );
  
        Swal.fire({
          icon: "success",
          title: "Marked as Sold",
          text: "Product updated successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not update product",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Something went wrong",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Single effect: profile + products flow handled yahin
  useEffect(() => {
    if (!session?.user?.contact) return;

    const fetchData = async () => {
      try {
        setLoadingProfile(true);
        setLoadingProducts(true);

        // 1️⃣ Profile fetch
        const profileRes = await fetch(
          `/api/profile?userEmail=${session.user.contact}`
        );
        if (profileRes.ok) {
          const profile: ShopData = await profileRes.json();
          setShopData(profile);

          // 2️⃣ Products fetch – jaise hi user._id mil gaya
          const ownerId = profile?.user?._id;
          if (ownerId) {
            const productsRes = await fetch(
              `/api/products/getMyProducts?shopOwnerID=${ownerId}`
            );
            const data = await productsRes.json();
            if (Array.isArray(data)) {
              setProducts(data);
            } else {
              console.warn("No products found or error:", data);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile/products:", error);
      } finally {
        setLoadingProfile(false);
        setLoadingProducts(false);
      }
    };

    fetchData();
  }, [session]);

  const tabs = [
    {
      label: <div className={styles.WrapMyAdsBtn}><span className="icon-shop"></span> <div className={styles.labelWraper}><span className={styles.myadsLabel}>My Ads</span><span className={styles.ManageAdsLabel}>Manage Your Ads</span></div> <span className="icon-right-open-big"></span></div>,
      className: styles.myAdsBtn,
      content: (
        <div className={styles.myAdss}>
          {/* <div className={styles.makeProductFutured}>
            <h2>My Products</h2>
            <p>Listed Ads: <strong>{products.length}</strong></p>
          </div> */}

          {/* ✅ Products skeleton loading */}
          {loadingProducts ? (
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
                width={200}
                height={200}
                priority
              />
              <p>No products Listed At</p>

              <Link
                href="/ProductForm"
                className={`${styles.sellAdd} ${"icon-shop"}`}
              >
                List Your Add
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.productGridWrapper}>
                {products.some((p: any) => p.status === "expired") && (
                  <div className={styles.upgradeTopWrapper}>
                    <Link href="/subscribePlan" className={styles.upgradeButton}>Upgrade</Link>
                  </div>
                )}
                <div className={styles.ProductTabs}>
                    <button className={activeTab === "all" ? styles.activeTab : ""} onClick={() => setActiveTab("all")}>All <span className={styles.badge}>{products.length}</span></button>
                    <button className={activeTab === "rent" ? styles.activeTab : ""} onClick={() => setActiveTab("rent")}>Rental <span className={styles.badge}>{rentProducts.length}</span></button>
                    <button className={activeTab === "sale" ? styles.activeTab : ""} onClick={() => setActiveTab("sale")}>Sale <span className={styles.badge}>{saleProducts.length}</span></button>
                    <button className={activeTab === "sold" ? styles.activeTab : ""} onClick={() => setActiveTab("sold")}>Sold <span className={styles.badge}>{soldProducts.length}</span></button>
                </div>

                <div className={styles.tabContent}>
                    <div className={styles.productGrid}>
                      {(
                        activeTab === "all"
                          ? products
                          : activeTab === "rent"
                          ? rentProducts
                          : activeTab === "sale"
                          ? saleProducts
                          : soldProducts
                      ).length === 0 ? (
                        <div className={styles.noAdsFound}>
                          <Image
                            src="/icons/not-found.png"
                            alt="No Ads"
                            width={120}
                            height={120}
                          />
                          <h3>No Ads</h3>
                          <p>No ads available in this section.</p>
                        </div>
                      ) : (
                        (
                          activeTab === "all"
                            ? products
                            : activeTab === "rent"
                            ? rentProducts
                            : activeTab === "sale"
                            ? saleProducts
                            : soldProducts
                        )
                          .slice(0, visibleCount)
                          .map((product: any) => (
                            <ProductPost
                              key={product._id}
                              _id={product._id}
                              title={product.title}
                              description={""}
                              category={product.category}
                              subCategory={product.subcategory}
                              price={Number(product.price)}
                              SalePrice={product.SalePrice}
                              location={product.location || "Not specified"}
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
                                product.coverImage ||
                                product.images?.[0] ||
                                "/images/DefoultLogo.jpg"
                              }
                              images={product.images || []}
                              createdAt={product.createdAt}
                              isFeatured={product.feature || false}
                              onDelete={handleDelete}
                              onSold={handleMarkSold}
                              status={product.status}
                              onUpdate={(id) =>
                                router.push(`/product/productUpdate/${id}`)
                              }
                              shopOwnerID={product.shopOwnerID}
                              className={`${styles.ProfileProduct} ${
                                product.status === "sold"
                                  ? styles.SoledProduct
                                  : ""
                              }`}
                              CoverImgClass={styles.ProfileCoverImg}
                              favoriteIconeClass={styles.ProfileFavoriteIcon}
                            />
                          ))
                      )}
                    </div>

                    {visibleCount <
                      (
                        activeTab === "all"
                          ? products.length
                          : activeTab === "rent"
                          ? rentProducts.length
                          : activeTab === "sale"
                          ? saleProducts.length
                          : soldProducts.length
                      ) && (
                      <div className={styles.viewMoreWrapper}>
                        <Button
                          className={styles["highlight-button"]}
                          onClick={handleViewMore}
                          color="black"
                          text="white"
                          href={""}
                        >
                          View More
                        </Button>
                      </div>
                    )}
                  </div>


              </div>

              {/* {visibleCount < products.length && (
                <div className={styles.viewMoreWrapper}>
                  <Button
                    className={styles["highlight-button"]}
                    onClick={handleViewMore}
                    color="black"
                    text="white"
                    href={""}
                  >
                    View More
                  </Button>
                </div>
              )} */}
            </>
          )}

          {/* ✅ Action loader (delete etc.) */}
          {actionLoading && <Loader message="Please wait..." />}
        </div>
      ),
    },
    {
      label: <div className={styles.WrapMyAdsBtn}><span className="icon-edit"></span> <div className={styles.labelWraper}><span className={styles.myadsLabel}>Edit Profile</span><span className={styles.ManageAdsLabel}>Update Your Details</span></div> <span className="icon-right-open-big"></span></div>,
      className: styles.editProfileBtn,
      content: <UpdateDetail />,
    },
  ];

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

      <div className={styles.mainContent}>
        <div className={styles.leftColumn}>
          <Tabs tabs={tabs} />
          <div className={styles.mobileSellerInfoAcount}>
          {isMobile && (
              <div className={styles.sellerInfo}>
                <div className={styles.shopID}>
                  <p>
                    <span className="icon-user-circle"></span> <b>User ID</b>: {shopData?.user?._id || "N/A"}
                  </p>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className={styles.deleteBtn}
                >
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.detailsSection}>
            <div className={styles.storeCard}>
              <div className={styles.focusedata}>
              <div className={styles.activeAds}><h5>{products.length}</h5><span>Active Ads</span></div>
                {loadingProfile ? (
                  <>
                    {/* Profile Image Skeleton */}
                    <div className={styles.profileSkeletonImage}></div>
                    {/* Name Skeleton */}
                    <div className={styles.profileSkeletonName}></div>
                  </>
                ) : (
                  <>
                    <Image
                      src={shopData?.user?.photo || "/images/profile.png"}
                      width={100}
                      height={100}
                      alt="userProfile"
                      className={styles.profileImage}
                      placeholder="blur"
                      blurDataURL="/images/profile-blur.png"
                      priority
                    />
                    <div className={styles.userPersonalDetails}>
                        <h3>{shopData?.user?.name || "User"}</h3>
                        <div className={styles.verifiedBadge}>
                          <span className={styles.icon}>✓</span>
                          <span className={styles.text}>Verified</span>
                        </div>
                    </div>
                  </>
                )}
              </div>


              <div className={styles.personalDetails}>
                <p>
                  <span className="icon-phone">
                    {" "}
                    {shopData?.user?.mobile || "N/A"}
                  </span>
                </p>
                <p>
                  <span className="icon-mail">
                    {shopData?.user?.contact || "N/A"}
                  </span>
                </p>
              </div>

              {/* Optional: profile level loader */}
              {/* {loadingProfile && (
                <p className={styles.smallLoadingText}>Loading profile...</p>
              )} */}
              
            </div>
          </div>


          {/* <div className={styles.sellerInfo}>
            <div className={styles.shopID}>
              <p>
                <b>SHOP ID</b>: {shopData?.user?._id || "N/A"}
              </p>
            </div>
            <button onClick={handleDeleteAccount} className={styles.deleteBtn}>Delete Account</button>
          </div> */}
          {!isMobile && (
              <div className={styles.sellerInfo}>
                <div className={styles.shopID}>
                  <p>
                    <b>SHOP ID</b>: {shopData?.user?._id || "N/A"}
                  </p>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className={styles.deleteBtn}
                >
                  Delete Account
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default withProtectedPage(PropertyDetailPage);
