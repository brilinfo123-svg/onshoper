"use client";

import { useSession, signOut } from "next-auth/react";
import { useMemo, useEffect, useState, useCallback } from "react";
import { withProtectedPage } from "@/components/withProtectedPage";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import ProductPost from "@/components/ProductPost/Index";
import Tabs from "@/components/Tabs/Index";
import UpdateDetail from "@/components/UpdateDetail/Index";

import styles from "@/styles/Profile.module.scss";
import SkeletonCard from "@/components/SkeletonCard/Index";
import Button from "@/components/Button/Index";
import Swal from "sweetalert2";
import Head from "next/head";
import Loader from "@/components/loader/Index";

interface ShopData {
  user: any;
  products: any[];
  favourites?: any[];
  shop?: any;
  shopOwner?: any;
  paidUntil?: any;
}

const PropertyDetailPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [shopData, setShopData] = useState<ShopData | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  console.log(shopData);

  // =========================
  // MOBILE CHECK
  // =========================
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================
  // FETCH PROFILE + PRODUCTS
  // =========================
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.contact) return;

    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        setLoadingProfile(true);
        setLoadingProducts(true);

        const response = await fetch(
          `/api/profile?userEmail=${session.user.contact}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();

        if (!isMounted) return;

        setShopData(data || null);
        setProducts(data?.products || []);
      } catch (error) {
        console.error("Profile Fetch Error:", error);
      } finally {
        if (isMounted) {
          setLoadingProfile(false);
          setLoadingProducts(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [session?.user?.contact, status]);

  // =========================
  // MEMOIZED PRODUCTS
  // =========================

  const activeProducts = useMemo(() => {
    return products.filter((p: any) => p.status !== "sold");
  }, [products]);
  
  const rentProducts = useMemo(() => {
    return products.filter(
      (p: any) =>
        p.SaleType === "Rent" &&
        p.status !== "sold"
    );
  }, [products]);
  
  const saleProducts = useMemo(() => {
    return products.filter(
      (p: any) =>
        p.SaleType === "Sale" &&
        p.status !== "sold"
    );
  }, [products]);
  
  const soldProducts = useMemo(() => {
    return products.filter(
      (p: any) => p.status === "sold"
    );
  }, [products]);

  const currentProducts = useMemo(() => {
    switch (activeTab) {
      case "all":
        return activeProducts;
      case "rent":
        return rentProducts;
      case "sale":
        return saleProducts;
      case "sold":
        return soldProducts;
      default:
        return [];
    }
  }, [activeTab, activeProducts, rentProducts, saleProducts, soldProducts]);

  // =========================
  // VIEW MORE
  // =========================
  const handleViewMore = useCallback(() => {
    setVisibleCount((prev) => prev + 3);
  }, []);

  // =========================
  // TAB CHANGE
  // =========================
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    setVisibleCount(4);
  }, []);

  // =========================
  // DELETE ACCOUNT
  // =========================
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
      setActionLoading(true);

      const res = await fetch("/api/account/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact: session?.user?.contact,
        }),
      });

      const result = await res.json();

      if (result.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Your account and products have been removed.",
          icon: "success",
        }).then(() => {
          signOut({
            callbackUrl: "/login",
          });
        });
      } else {
        Swal.fire(
          "Error",
          result.message || "Failed to delete account.",
          "error"
        );
      }
    } catch (error) {
      console.error(error);

      Swal.fire("Error", "Something went wrong.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
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
      setActionLoading(true);

      const res = await fetch(
        `/api/products/deleteProduct?id=${productId}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        setProducts((prev) =>
          prev.filter((item: any) => item._id !== productId)
        );

        Swal.fire({
          title: "Deleted!",
          text: "Your ad has been successfully removed.",
          icon: "success",
        });
      } else {
        Swal.fire({
          title: "Error",
          text: "Failed to delete ad.",
          icon: "error",
        });
      }
    } catch (error) {
      console.error(error);

      Swal.fire({
        title: "Error",
        text: "Something went wrong.",
        icon: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // MARK SOLD
  // =========================
  const handleMarkSold = async (productId: string) => {
    const confirm = await Swal.fire({
      title: "Mark as Sold?",
      text: "This product will be moved to Sold section.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);

      const res = await fetch(`/api/products/markSold?id=${productId}`,
        {
          method: "PUT",
        }
      );

      if (res.ok) {
        setProducts((prev) =>
          prev.map((item: any) =>
            item._id === productId
              ? { ...item, status: "sold" }
              : item
          )
        );

        Swal.fire({
          icon: "success",
          title: "Marked as Sold",
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

  const handleRepublish = async (productId: string) => {
    const confirm = await Swal.fire({
      title: "Republish Product?",
      text: "This product will become active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Republish",
      cancelButtonText: "Cancel",
    });
  
    if (!confirm.isConfirmed) return;
  
    try {
      setActionLoading(true);
  
      const res = await fetch(
        `/api/products/republish?id=${productId}`,
        {
          method: "PUT",
        }
      );
  
      if (res.ok) {
        setProducts((prev) =>
          prev.map((item: any) =>
            item._id === productId
              ? { ...item, status: "active" }
              : item
          )
        );
  
        Swal.fire({
          icon: "success",
          title: "Republished Successfully",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: "Could not republish product",
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

  // =========================
  // TABS
  // =========================
  const tabs = [
    {
      label: (
        <div className={styles.WrapMyAdsBtn}>
          <span className="icon-shop"></span>
          <div className={styles.labelWraper}>
            <span className={styles.myadsLabel}>My Ads</span>
            <span className={styles.ManageAdsLabel}>Manage Your Ads</span>
          </div>
          <span className="icon-right-open-big"></span>
        </div>
      ),
      className: styles.myAdsBtn,

      content: (
        <div className={styles.myAdss}>
          {loadingProducts ? (
            <div className={styles.productGrid}>
              {[...Array(6)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.notFoundShops}>
              <Image src="/icons/not-found.png" alt="not-found" width={200} height={200} priority/>
              <p>No products listed yet</p>
              <Link href="/ProductForm" className={`${styles.sellAdd} icon-shop`}>List Your Ad</Link>
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
                  <button className={activeTab === "all" ? styles.activeTab : ""} onClick={() => handleTabChange("all")}>All {activeProducts.length > 0 && <span className={styles.badge}>{activeProducts.length}</span>}</button>
                  <button className={activeTab === "rent" ? styles.activeTab : ""} onClick={() => handleTabChange("rent")}>Rental {rentProducts.length > 0 && <span className={styles.badge}>{rentProducts.length}</span>}</button>
                  <button className={activeTab === "sale" ? styles.activeTab : ""} onClick={() => handleTabChange("sale")}>Sale {saleProducts.length > 0 && <span className={styles.badge}>{saleProducts.length}</span>}</button>
                  <button className={activeTab === "sold" ? styles.activeTab : ""} onClick={() => handleTabChange("sold")}>Sold {soldProducts.length > 0 && <span className={styles.badge}>{soldProducts.length}</span>}</button>
                </div>

                <div className={styles.tabContent}>
                  <div className={styles.productGrid}>
                    {currentProducts.length === 0 ? (
                      <div className={styles.noAdsFound}>
                        <Image src="/icons/not-found.png" alt="No Ads" width={120} height={120}/>
                        <h3>No Ads</h3>
                        <p>No ads available in this section.</p>
                      </div>
                    ) : (
                      currentProducts
                        .slice(0, visibleCount)
                        .map((product: any) => (
                          <ProductPost
                            key={product._id}
                            _id={product._id}
                            title={product.title}
                            description=""
                            category={product.category}
                            subCategory={product.subcategory}
                            price={Number(product.price)}
                            SalePrice={product.SalePrice}
                            location={product.location || "Not specified"}
                            priceWeek={product.priceWeek ? Number(product.priceWeek) : undefined}
                            priceMonth={product.priceMonth ? Number(product.priceMonth) : undefined}
                            coverImage={product.coverImage || product.images?.[0] || "/images/DefoultLogo.jpg"}
                            images={product.images || []}
                            createdAt={product.createdAt}
                            isFeatured={product.feature || false}
                            onDelete={handleDelete}
                            onSold={handleMarkSold}
                            onRepublish={handleRepublish}
                            status={product.status}
                            onUpdate={(id) => router.push(`/product/productUpdate/${id}`)}
                            shopOwnerID={product.shopOwnerID}
                            className={`${styles.ProfileProduct} ${product.status === "sold" ? styles.SoledProduct : ""}`}
                            CoverImgClass={styles.ProfileCoverImg}
                            favoriteIconeClass={styles.ProfileFavoriteIcon}
                          />
                        ))
                    )}
                  </div>

                  {visibleCount < currentProducts.length && (
                    <div className={styles.viewMoreWrapper}>
                      <Button className={styles["highlight-button"]} onClick={handleViewMore} color="black" text="white" href="">View More</Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
          {actionLoading && (
            <Loader message="Please wait..." />
          )}
        </div>
      ),
    },

    {
      label: (
        <div className={styles.WrapMyAdsBtn}>
          <span className="icon-edit"></span>
          <div className={styles.labelWraper}>
            <span className={styles.myadsLabel}>Edit Profile</span>
            <span className={styles.ManageAdsLabel}>Update Your Details</span>
          </div>
          <span className="icon-right-open-big"></span>
        </div>
      ),
      className: styles.editProfileBtn,
      content: <UpdateDetail />,
    },
  ];

  return (
    <div className="container">
      <Head>
        <title>My Profile – OnShoper</title>
        <meta name="description" content="View and manage your OnShoper profile."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <meta charSet="UTF-8" />
      </Head>

      <div className={styles.mainContent}>
        {/* LEFT */}
        <div className={styles.leftColumn}>
          <Tabs tabs={tabs} />
          {isMobile && (
            <div className={styles.mobileSellerInfoAcount}>
              <div className={styles.sellerInfo}>
                {/* <div className={styles.shopID}>
                  <p><span className="icon-user-circle"></span> <b>User ID</b>:{" "} {shopData?.user?._id || "N/A"}</p>
                </div> */}
                <button onClick={handleDeleteAccount} className={styles.deleteBtn}>Delete Account</button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className={styles.rightColumn}>
          <div className={styles.detailsSection}>
            <div className={styles.storeCard}>
              <div className={styles.focusedata}>
                <div className={styles.BackBtnWrapper}>
                  <Link href="/" className={`${styles.backButtonWrap} ${"icon-left-1"}`}></Link>
                </div>
                <div className={styles.activeAds}>
                  <h5>{products.length}</h5>
                  <span>Ads</span>
                </div>
                {loadingProfile ? (
                  <>
                    <div className={styles.profileSkeletonImage}></div>
                    <div className={styles.profileSkeletonName}></div>
                    <div className={styles.profileSkeletonName}></div>
                  </>
                ) : (
                  <>
                    <Image src={shopData?.user?.photo || "/images/profile.png"} width={100} height={100} alt="userProfile" className={styles.profileImage} priority/>
                    <div className={styles.userPersonalDetails}>
                      <h3>{shopData?.user?.name || "User"}</h3>
                      <div
                        className={styles.verifiedBadge}
                      >
                        <span className={styles.icon}>
                          ✓
                        </span>
                        <span className={styles.text}>
                          Verified
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.personalDetails}>
                <div className={styles.detailCard}>
                  <div className={`${styles.iconBox} ${styles.IconPhone}`}>
                    <span className="icon-phone"></span>
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.label}>Phone Number</span>
                    <p>{shopData?.user?.mobile || "N/A"}</p>
                  </div>
                </div>
                <div className={styles.detailCard}>
                  <div className={`${styles.iconBox} ${styles.IconMail}`}>
                    <span className="icon-mail"></span>
                  </div>
                  <div className={styles.detailContent}>
                    <span className={styles.label}>Email Address</span>
                    <p>{shopData?.user?.contact || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {!isMobile && (
            <div className={styles.sellerInfo}>
              <div className={styles.shopID}>
                <p><b>SHOP ID</b>:{" "} {shopData?.user?._id || "N/A"}</p>
              </div>
              <button onClick={handleDeleteAccount} className={styles.deleteBtn}>Delete Account</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withProtectedPage(PropertyDetailPage);