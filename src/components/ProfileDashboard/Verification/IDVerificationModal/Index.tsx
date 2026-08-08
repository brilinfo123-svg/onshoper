"use client";
import { useState } from "react";
import styles from "./Index.module.scss";

export default function IDVerificationModal({ onClose }) {
  const [idType, setIdType] = useState("");
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append("idType", idType);
    formData.append("frontImage", frontImage);
    formData.append("backImage", backImage);

    await fetch("/api/verification/uploadID", {
      method: "POST",
      body: formData,
    });
    alert("ID submitted for verification!");
    onClose();
  };

  return (
    <div className={styles.modal}>
      <h2>Upload Government ID</h2>
      <select
        className={styles.selectBox}
        onChange={(e) => setIdType(e.target.value)}
      >
        <option value="">Select ID Type</option>
        <option value="Aadhaar">Aadhaar</option>
        <option value="PAN">PAN</option>
        <option value="Passport">Passport</option>
        <option value="Driving License">Driving License</option>
      </select>

      <input
        type="file"
        className={styles.fileInput}
        onChange={(e) => setFrontImage(e.target.files[0])}
      />
      <input
        type="file"
        className={styles.fileInput}
        onChange={(e) => setBackImage(e.target.files[0])}
      />

      <button className={styles.button} onClick={handleSubmit}>
        Submit
      </button>
      <button className={styles.closeBtn} onClick={onClose}>
        Close
      </button>
    </div>
  );
}
