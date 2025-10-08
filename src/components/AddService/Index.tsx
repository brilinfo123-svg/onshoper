"use client";
import React, { useState } from "react";
import styles from "@/components/AddService/Index.module.scss";
import { ObjectId } from "bson";

interface Service {
  _id?: string;
  name: string;
  price: string;
  discount: string;
}

interface ProductFormProps {
  initialData?: { services: Service[] };
  mainObjectId: string; // Main object _id
  closeModal: () => void; // Function to close the modal
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, mainObjectId, closeModal }) => {
  const [formData, setFormData] = useState<{ services: Service[] }>({
    services: initialData?.services || [{ name: "Service 1", price: "100", discount: "10" }],
  });

  const [loading, setLoading] = useState(false); // Loading state

  const handleServiceChange = (index: number, field: keyof Service, value: string) => {
    const updatedServices = [...formData.services];
    updatedServices[index][field] = value;
    setFormData((prev) => ({ ...prev, services: updatedServices }));
  };

  const handleAddService = () => {
    setFormData((prev) => ({
      ...prev,
      services: [...prev.services, { name: "", price: "", discount: "" }],
    }));
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setLoading(true); // Set loading to true when submission starts

    const servicesWithIds = formData.services.map((service) => ({
      ...service,
      _id: service._id || new ObjectId().toHexString(),
    }));

    try {
      const response = await fetch("/api/addService", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id: mainObjectId, services: servicesWithIds }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log("Services added/updated successfully:", result);
        closeModal(); // Close modal after successful submission
      } else {
        console.error("Error adding/updating services:", result);
      }
    } catch (error) {
      console.error("Error submitting data:", error);
    } finally {
      setLoading(false); // Set loading to false after submission completes
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <div className={styles.servicesSection}>
          {formData.services.map((service, index) => (
            <div key={index} className={styles.serviceRow}>
              <div className={styles.formGroup}>
                <label>Add Your Services *</label>
                <input
                  type="text"
                  placeholder="Service Name"
                  value={service.name}
                  onChange={(e) => handleServiceChange(index, "name", e.target.value)}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.priceInput}`}>
                <label className="icon-rupee"> Price*</label>
                <input
                  type="number"
                  placeholder="Price"
                  value={service.price}
                  onChange={(e) => handleServiceChange(index, "price", e.target.value)}
                />
              </div>
              <div className={`${styles.formGroup} ${styles.discountInput}`}>
                <label>Discount</label>
                <input
                  type="number"
                  placeholder="%"
                  value={service.discount}
                  onChange={(e) => handleServiceChange(index, "discount", e.target.value)}
                />
              </div>
              <button type="button" onClick={() => handleRemoveService(index)}>
                <span className="icon-cancel"></span>
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddService}>
            Add More Service
          </button>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button type="submit" className={styles.submitButton} disabled={loading}>
          {loading ? (
            <div className={styles.submiting}>Submitting... <span className={styles.loader}></span></div> // Display loader when loading
          ) : (
            "Submit"
          )}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
