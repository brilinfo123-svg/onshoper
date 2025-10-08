"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "@/styles/ProductForm.module.scss";
import PickupLocationSearch from "@/components/PickupLocationSearch/Index";
import Swal from "sweetalert2";

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  subCategory: string;
  location: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export default function UpdateProduct() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    instagram: "",
    facebook: "",
    twitter: "",
  });

  // ✅ Fetch product by id
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      const res = await fetch(`/api/updateProduct/${id}`);
      const data = await res.json();

      if (data.success && data.product) {
        setProduct(data.product);

        setForm({
          title: data.product.title,
          description: data.product.description,
          instagram: data.product.instagram || "",
          facebook: data.product.facebook || "",
          twitter: data.product.twitter || "",
        });
      }
    };

    fetchProduct();
  }, [id]);

  // ✅ Input change handler
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const res = await fetch(`/api/updateProduct/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
  
      if (res.ok) {
        await Swal.fire({
          title: "✅ Product Updated",
          text: "Your product has been successfully updated.",
          icon: "success",
          confirmButtonText: "View Product",
        });
  
        router.push(`/product/${id}`);
      } else {
        const errorText = await res.text();
        await Swal.fire({
          title: "❌ Update Failed",
          text: errorText || "Something went wrong while updating the product.",
          icon: "error",
          confirmButtonText: "Try Again",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      await Swal.fire({
        title: "❌ Error",
        text: "Unexpected error occurred. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

  // if (!product) return <p>Loading product...</p>;

  return (
    <div className={styles.formContainer}>
      <h2>Update Product</h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className={styles.slideIn}>
          <div className={styles.formGroup}>
            <label>Title</label>
            <input type="text" name="title" value={form.title} onChange={handleChange} />
          </div>
        </div>

        {/* Description */}
        <div className={styles.slideIn}>
          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} />
          </div>
        </div>

        {/* ✅ Social Links */}
        <div className={styles.socialLink}>
          <div className={styles.formGroup}>
            <label className="icon-instagram">
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialVisitLink}
                title="Open Instagram"
              >
                Instagram Link
              </Link>
            </label>
            <input
              type="url"
              name="instagram"
              placeholder="https://instagram.com/yourprofile"
              value={form.instagram}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="icon-facebook">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialVisitLink}
                title="Open Facebook"
              >
                Facebook Link
              </a>
            </label>
            <input
              type="url"
              name="facebook"
              placeholder="https://facebook.com/yourprofile"
              value={form.facebook}
              onChange={handleChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label className="icon-twitter">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialVisitLink}
                title="Open Twitter"
              >
                Twitter Link
              </a>
            </label>
            <input
              type="url"
              name="twitter"
              placeholder="https://twitter.com/yourprofile"
              value={form.twitter}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className={styles.submitButton}>
          Update
        </button>
      </form>
    </div>
  );
}
