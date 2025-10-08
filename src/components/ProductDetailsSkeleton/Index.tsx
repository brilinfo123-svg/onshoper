import React from 'react';
import styles from './Index.module.scss';

const ProductDetailsSkeleton = () => {
  return (
    <div className={styles.productDetailsSkeleton}>
      {/* Breadcrumb Skeleton */}

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Image Gallery Skeleton */}
        <div className={styles.imageGallerySkeleton}>
          <div className={styles.mainImageSkeleton}></div>
          <div className={styles.thumbnailContainer}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={styles.thumbnailSkeleton}></div>
            ))}
          </div>
        </div>

        {/* Product Info Skeleton */}
        <div className={styles.productInfoSkeleton}>
          <div className={styles.productHeader}>
            <div className={styles.skeletonTitle} style={{width: '80%'}}></div>
          </div>

          {/* Price Skeleton */}
          <div className={styles.priceSkeleton}>
            <div className={styles.skeletonPrice}></div>
            <div className={styles.skeletonOriginalPrice}></div>
          </div>

          {/* Rating Skeleton */}
          <div className={styles.ratingSkeleton}>
            <div className={styles.skeletonStars}></div>
            <div className={styles.skeletonReviewCount}></div>
          </div>

          {/* Description Skeleton */}
          <div className={styles.descriptionSkeleton}>
            <div className={styles.skeletonText} style={{width: '100%'}}></div>
            <div className={styles.skeletonText} style={{width: '95%'}}></div>
            <div className={styles.skeletonText} style={{width: '90%'}}></div>
            <div className={styles.skeletonText} style={{width: '85%'}}></div>
          </div>

          {/* Color/Size Options Skeleton */}
          <div className={styles.optionsSkeleton}>
            <div className={styles.skeletonSubtitle}></div>
            <div className={styles.optionChips}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={styles.skeletonChip}></div>
              ))}
            </div>
          </div>

          {/* Quantity Skeleton */}
          <div className={styles.quantitySkeleton}>
            <div className={styles.skeletonSubtitle}></div>
            <div className={styles.quantitySelectorSkeleton}></div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className={styles.actionButtonsSkeleton}>
            <div className={styles.skeletonButton} style={{width: '200px'}}></div>
            <div className={styles.skeletonButton} style={{width: '150px'}}></div>
          </div>
        </div>
      </div>

      {/* Product Tabs Skeleton */}
      <div className={styles.tabsSkeleton}>
        <div className={styles.tabHeaders}>
          {['Description', 'Specifications', 'Reviews', 'Shipping'].map((tab, i) => (
            <div key={i} className={styles.skeletonTab}></div>
          ))}
        </div>
        <div className={styles.tabContent}>
          <div className={styles.skeletonText} style={{width: '100%'}}></div>
          <div className={styles.skeletonText} style={{width: '95%'}}></div>
          <div className={styles.skeletonText} style={{width: '90%'}}></div>
        </div>
      </div>

      {/* Related Products Skeleton */}
      <div className={styles.relatedProductsSkeleton}>
        <div className={styles.skeletonSectionTitle}></div>
        <div className={styles.relatedProductsGrid}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className={styles.relatedProductCard}>
              <div className={styles.relatedProductImage}></div>
              <div className={styles.relatedProductInfo}>
                <div className={styles.skeletonText} style={{width: '80%'}}></div>
                <div className={styles.skeletonText} style={{width: '60%'}}></div>
                <div className={styles.skeletonText} style={{width: '50%'}}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsSkeleton;