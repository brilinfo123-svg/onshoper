"use client";

import React, { useEffect, useState } from "react";
import styles from "./Index.module.scss";

interface Category {
  id: number;
  name: string;
}

const Sidebar = () => {

  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");


  const fetchShops = async () => {
    try {
      const response = await fetch("/api/localShop");
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to fetch local shops");
      }
      const data = await response.json();
      setShops(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  console.log(shops, "SideBar");
  useEffect(() => {
    fetchShops();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  const categories: Category[] = [
    { id: 1, name: "Electronics" },
    { id: 2, name: "Fashion" },
    { id: 3, name: "Home Appliances" },
    { id: 4, name: "Books" },
    { id: 5, name: "Sports" },
    { id: 6, name: "Music" },
    { id: 7, name: "Beauty Parlour" },
    { id: 8, name: "Saloon" },
    { id: 9, name: "Bike Puncture" },
    { id: 10, name: "Car Puncture" },
    { id: 11, name: "Bus Puncture" },
    { id: 12, name: "Medical Stores" },
    { id: 13, name: "Cloth Wholesale" },
    { id: 14, name: "Bike Showroom" },
    { id: 15, name: "Car Showroom" },
    { id: 16, name: "Police Chowki" },
    { id: 17, name: "Hospitals" },
    { id: 18, name: "Petrol Pump" },
    { id: 19, name: "Halwai" },
    { id: 20, name: "Kirana Store" },
    { id: 21, name: "Theka Daru" },
  ];

  const handleCategoryChange = (categoryId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className={styles.sidebar}>
      <h2>Filter by Categories</h2>
      <input
        type="text"
        placeholder="Search categories"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />
      <ul>
        {filteredCategories.map((category) => (
          <li key={category.id}>
            <label>
              <input
                type="checkbox"
                value={category.id}
                checked={selectedCategories.includes(category.id)}
                onChange={() => handleCategoryChange(category.id)}
              />
              {category.name}
            </label>
          </li>
        ))}
        {filteredCategories.length === 0 && (
          <p className={styles.noResults}>No categories found</p>
        )}
      </ul>
    </aside>
  );
};

export default Sidebar;
