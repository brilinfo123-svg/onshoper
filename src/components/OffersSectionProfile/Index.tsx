import React, { useEffect, useRef, useState } from "react";
import Slider from "react-slick";
import Image from "next/image";
import styles from "@/components/OffersSectionProfile/Index.module.scss";

const Index = () => {
  const [offers, setOffers] = useState([
    {
      title: "Flat 20% off on Groceries",
      description: "Enjoy amazing deals on groceries!",
      expiryDate: "Expires on: Dec 31, 2024",
    },
    {
      title: "Buy 1 Get 1 Free at Cafe Bliss",
      description: "Treat yourself with free meals at Cafe Bliss. Don't miss out!",
      expiryDate: "Expires on: Jan 15, 2025",
    },
    {
      title: "15% off on Electronics",
      description: "Get the best deals on electronics and gadgets today!",
      expiryDate: "Expires on: Feb 28, 2025",
    },
    {
      title: "Free Delivery on All Orders",
      description: "Shop now and enjoy free delivery on all products!",
      expiryDate: "Expires on: Mar 10, 2025",
    },
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedOffer, setEditedOffer] = useState(null);

  const handleEdit = (index: number) => {
    setEditedOffer({ ...offers[index], index });
    setIsEditing(true);
  };

  const handleDelete = (index: number) => {
    const confirmed = window.confirm("Are you sure you want to delete this offer?");
    if (confirmed) {
      setOffers((prevOffers) => prevOffers.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    if (editedOffer) {
      const updatedOffers = [...offers];
      updatedOffers[editedOffer.index] = {
        title: editedOffer.title,
        description: editedOffer.description,
        expiryDate: editedOffer.expiryDate,
      };
      setOffers(updatedOffers);
      setIsEditing(false);
      setEditedOffer(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    setEditedOffer((prevState) => ({
      ...prevState!,
      [field]: e.target.value,
    }));
  };

  return (
    <div className={styles.offersSection}>
      <h2 className={styles.sectionTitle}>My Offers</h2>
      <table className={styles.offerTable}>
        <thead>
          <tr>
            <th>Offer Title</th>
            <th>Description</th>
            <th>Expiry Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer, index) => (
            <tr key={index}>
              {isEditing && editedOffer?.index === index ? (
                <>
                  <td>
                    <input
                      type="text"
                      value={editedOffer.title}
                      onChange={(e) => handleChange(e, "title")}
                    />
                  </td>
                  <td>
                    <textarea
                      value={editedOffer.description}
                      onChange={(e) => handleChange(e, "description")}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={editedOffer.expiryDate}
                      onChange={(e) => handleChange(e, "expiryDate")}
                    />
                  </td>
                  <td>
                   <div className={styles.actionBtn}>
                   <button className={styles.saveButton} onClick={handleSave}>
                      Save
                    </button>
                    <button className={styles.cancelButton} onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                   </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{offer.title}</td>
                  <td>{offer.description}</td>
                  <td>{offer.expiryDate}</td>
                  <td>
                  <div className={styles.actionBtn}>
                    <button className={styles.editButton} onClick={() => handleEdit(index)}>
                      Edit
                    </button>
                    <button className={styles.deleteButton} onClick={() => handleDelete(index)}>
                      Delete
                    </button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Index;
