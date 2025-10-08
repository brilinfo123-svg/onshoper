"use client";

import { useEffect, useState } from "react";
import ProductFilterTabs from "@/components/ProductFilterTabs/Index";
import Sidebar from "@/components/Sidebar/Index";
import styles from "@/styles/Home.module.scss";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        setProducts(data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubcategoryChange = (subcategory: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((s) => s !== subcategory)
        : [...prev, subcategory]
    );
  };

  // ✅ Apply filtering before sending to ProductFilterTabs
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(product.category);

    const matchSubcategory =
      selectedSubcategories.length === 0 ||
      selectedSubcategories.includes(product.subcategory);

    return matchCategory && matchSubcategory;
  });

  return (
    <div className="container">
      <div className={styles.rowFlex}>
        <Sidebar
          products={products}
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
          selectedSubcategories={selectedSubcategories}
          onSubcategoryChange={handleSubcategoryChange}
        />
        <div className={styles.mainContent}>
          <ProductFilterTabs
            products={filteredProducts} // 👈 use filteredProducts
            productsLoading={loading}
            displayCount={8}
          />
        </div>
      </div>
    </div>
  );
}
