"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import DashboardLayout from "@/components/ProfileDashboard/Layout/DashboardLayout";
import ProductPost from "@/components/ProductPost/Index";
import SkeletonCard from "@/components/SkeletonCard/Index";
import Loader from "@/components/loader/Index";
import Image from "next/image";
import Link from "next/link";
import Swal from "sweetalert2";
import { useProfile } from "@/contexts/ProfileContext";
import styles from "./Index.module.scss";
import { useSession } from "next-auth/react";
import { FiCheckCircle, FiHome, FiShoppingBag } from "react-icons/fi";
import router from "next/router";
import UpdateProductModal from "@/components/ProfileDashboard/Dashboard/UpdateProductModal/Index";
import { withProtectedPage } from "@/components/withProtectedPage";


const MyAds = () => {
  const { profile: shopData, products, loading, fetchProfile, setProducts } = useProfile();
  const { data: session, status } = useSession();

  const [activeTab, setActiveTab] = useState("sale");
  const [visibleCount, setVisibleCount] = useState(8);
  const [actionLoading, setActionLoading] = useState(false);
  const [updateModalId, setUpdateModalId] = useState(null);

  // Fetch profile + products
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.contact) return;
    fetchProfile(session.user.contact);
  }, [status, session?.user?.contact, fetchProfile]);

  const loadingProducts = loading;

  // Filter products
  const saleProducts = useMemo(
    () => products.filter((p) => p.SaleType?.toLowerCase() === "sale" && p.status !== "sold"),
    [products]
  );

  const rentalProducts = useMemo(
    () => products.filter((p) => p.SaleType?.toLowerCase() === "rent" && p.status !== "sold"),
    [products]
  );

  const soldProducts = useMemo(
    () => products.filter((p) => p.status === "sold"),
    [products]
  );

  const currentProducts = useMemo(() => {
    switch (activeTab) {
      case "sale":
        return saleProducts;
      case "rental":
        return rentalProducts;
      case "sold":
        return soldProducts;
      default:
        return saleProducts;
    }
  }, [activeTab, saleProducts, rentalProducts, soldProducts]);

  const openUpdateModal = (id) => {
    setUpdateModalId(id);
  };
  
  // Tab change
  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
    setVisibleCount(8);
  }, []);

  // View more
  const handleViewMore = useCallback(() => {
    setVisibleCount((prev) => prev + 8);
  }, []);

  // Delete product
  const handleDelete = async (productId) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete your ad.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/products/deleteProduct?id=${productId}`, { method: "DELETE" });

      if (res.ok) {
        setProducts((prev) => prev.filter((item) => item._id !== productId));
        Swal.fire("Deleted!", "Your ad has been removed.", "success");
      } else {
        Swal.fire("Error", "Failed to delete ad.", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Mark sold
  const handleMarkSold = async (productId) => {
    const confirm = await Swal.fire({
      title: "Mark as Sold?",
      text: "This product will move to Sold section.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/products/markSold?id=${productId}`, { method: "PUT" });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item._id === productId ? { ...item, status: "sold" } : item))
        );
        Swal.fire("Success", "Marked as Sold", "success");
      } else {
        Swal.fire("Error", "Could not update product", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Republish
  const handleRepublish = async (productId) => {
    const confirm = await Swal.fire({
      title: "Republish Product?",
      text: "This product will become active again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Republish",
    });

    if (!confirm.isConfirmed) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/products/republish?id=${productId}`, { method: "PUT" });

      if (res.ok) {
        setProducts((prev) =>
          prev.map((item) => (item._id === productId ? { ...item, status: "active" } : item))
        );
        Swal.fire("Success", "Republished Successfully", "success");
      } else {
        Swal.fire("Error", "Could not republish product", "error");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>My Ads</h2>

        <div className={styles.myAdsWrapper}>
          {loadingProducts ? (
            <div className={styles.productGrid}>
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className={styles.notFoundShops}>
              <Image src="/icons/not-found.png" alt="not-found" width={200} height={200} />
              <p>No ads listed yet</p>
              <Link href="/ProductForm" className={styles.sellAdd}>List Your Ad</Link>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className={styles.ProductTabs}>
                <button
                  className={activeTab === "sale" ? styles.activeTab : ""}
                  onClick={() => handleTabChange("sale")}
                >
                  <FiShoppingBag className={styles.tabIcon} />
                  Sale
                  {saleProducts.length > 0 && <span className={styles.badge}>{saleProducts.length}</span>}
                </button>

                <button
                  className={activeTab === "rental" ? styles.activeTab : ""}
                  onClick={() => handleTabChange("rental")}
                >
                  <FiHome className={styles.tabIcon} />
                  Rental
                  {rentalProducts.length > 0 && <span className={styles.badge}>{rentalProducts.length}</span>}
                </button>

                <button
                  className={activeTab === "sold" ? styles.activeTab : ""}
                  onClick={() => handleTabChange("sold")}
                >
                  <FiCheckCircle className={styles.tabIcon} />
                  Sold
                  {soldProducts.length > 0 && <span className={styles.badge}>{soldProducts.length}</span>}
                </button>
              </div>

              {/* Tab Content */}
              <div className={styles.tabContent}>
                {currentProducts.length === 0 ? (
                  <div className={styles.noAdsFound}>
                    <Image src="/icons/not-found.png" alt="No Ads" width={120} height={120} />
                    <h3>No Ads</h3>
                    <p>No ads available in this section.</p>
                  </div>
                ) : (
                  <div className={styles.productGrid}>
                    {currentProducts.slice(0, visibleCount).map((product) => (
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
                        onUpdate={(id) => openUpdateModal(id)}
                        shopOwnerID={product.shopOwnerID}
                        className={`${styles.ProfileProduct} ${product.status === "sold" ? styles.SoledProduct : ""}`}
                        CoverImgClass={styles.ProfileCoverImg}
                        CtaClassName={styles.actBtnGroup}
                      />
                    ))}
                  </div>
                )}

                {visibleCount < currentProducts.length && (
                  <div className={styles.viewMoreWrapper}>
                    <button className={styles.viewMoreBtn} onClick={handleViewMore}>
                      View More
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {actionLoading && <Loader message="Please wait..." />}
        </div>
      </div>
      {updateModalId && (
          <UpdateProductModal
            productId={updateModalId}
            onClose={() => setUpdateModalId(null)}
            onUpdated={() => fetchProfile(session.user.contact)}
          />
        )}

    </DashboardLayout>
  );
};

export default withProtectedPage(MyAds);
