"use client";

import React, { useEffect, useState } from "react";
import styles from "./Index.module.scss";
import Swal from "sweetalert2";
import { FiInstagram, FiFacebook, FiTwitter } from "react-icons/fi";

export default function UpdateProductModal({ productId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      const res = await fetch(`/api/updateProduct/${productId}`);
      const data = await res.json();

      if (data.success && data.product) {
        setForm({
          title: data.product.title,
          description: data.product.description,
          instagram: data.product.instagram || "",
          facebook: data.product.facebook || "",
          twitter: data.product.twitter || "",
        });
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`/api/updateProduct/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        Swal.fire("Updated!", "Product updated successfully.", "success");
        onUpdated();
        onClose();
      } else {
        Swal.fire("Error", "Failed to update product.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Unexpected error occurred.", "error");
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalBox}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        <h2 className={styles.modalTitle}>Update Product</h2>

        <form onSubmit={handleSubmit} className={styles.formWrapper}>

          {/* Title */}
          <div className={styles.formGroup}>
            <label>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} />
          </div>

          {/* Description */}
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>

          {/* Social Links */}
          <div className={styles.socialGroup}>
            <div className={`${styles.socialInput} ${styles.instagram}`}>
              <FiInstagram className={styles.socialIcon} />
              <input
                type="url"
                name="instagram"
                placeholder="Instagram profile link"
                value={form.instagram}
                onChange={handleChange}
              />
            </div>

            <div className={`${styles.socialInput} ${styles.facebook}`}>
              <FiFacebook className={styles.socialIcon} />
              <input
                type="url"
                name="facebook"
                placeholder="Facebook profile link"
                value={form.facebook}
                onChange={handleChange}
              />
            </div>

            <div className={`${styles.socialInput} ${styles.twitter}`}>
              <FiTwitter className={styles.socialIcon} />
              <input
                type="url"
                name="twitter"
                placeholder="Twitter profile link"
                value={form.twitter}
                onChange={handleChange}
              />
            </div>
          </div>


          {/* Buttons */}
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" className={styles.updateBtn}>
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
