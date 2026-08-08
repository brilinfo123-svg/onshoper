"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import styles from "./Index.module.scss";
import Loader from "@/components/loader/Index";

export default function ProfileUpdateModal({ onClose, onUpdated }) {
  const { data: session } = useSession();

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState("");
  const [previewPhoto, setPreviewPhoto] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch(`/api/users/profile?contact=${session.user.contact}`);
      const data = await res.json();

      setName(data.name || "");
      setMobile(data.mobile || "");
      setPhoto(data.photo || "");
      setPreviewPhoto("");

      setLoading(false);
    };

    loadProfile();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (typeof ev.target.result === "string") {
          setPreviewPhoto(ev.target.result);
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const uploadImage = async () => {
    if (!selectedFile) return photo;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch("/api/upload/user-photo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.filePath;
  };

  const updateProfile = async () => {
    setUpdating(true);

    try {
      const photoPath = await uploadImage();

      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: session.user.contact,
          name,
          mobile,
          photo: photoPath,
        }),
      });

      if (res.ok) {
        Swal.fire("Updated!", "Profile updated successfully.", "success");
        onUpdated();
        onClose();
      } else {
        Swal.fire("Error", "Failed to update profile.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "Something went wrong.", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalBox}><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBox}>
        {updating && <Loader message="Updating profile..." />}

        <h2 className={styles.title}>Edit Profile</h2>

        <div className={styles.photoSection}>
          <img
            src={previewPhoto || photo || "/images/profile.png"}
            className={styles.profileImg}
            alt="Profile"
          />

          <label className={styles.uploadBtn}>
            <span className="icon-camera"></span> Change Photo
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

        <div className={styles.formGroup}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className={styles.formGroup}>
          <label>Mobile</label>
          <input value={mobile} onChange={(e) => setMobile(e.target.value)} />
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.updateBtn} onClick={updateProfile}>Update</button>
        </div>
      </div>
    </div>
  );
}
