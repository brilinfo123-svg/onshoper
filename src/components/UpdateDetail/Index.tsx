"use client";

import React, { useEffect, useState, ChangeEvent } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import styles from "./Index.module.scss";
import Swal from "sweetalert2";

export default function ProfileForm() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [photo, setPhoto] = useState(""); // Final photo path
  const [previewPhoto, setPreviewPhoto] = useState(""); // Preview before upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const loadProfile = async () => {
    if (!session?.user?.contact) return;

    try {
      const res = await fetch(`/api/users/profile?contact=${session.user.contact}`);
      if (!res.ok) throw new Error("Failed to fetch profile");

      const data = await res.json();
      setName(data.name || "");
      setEmail(data.email || "");
      setMobile(data.mobile || "");
      setPhoto(data.photo || "");
      setPreviewPhoto(""); // Clear preview after loading actual photo
    } catch (error) {
      console.error("Profile fetch error:", error);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [session, status]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);

      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPreviewPhoto(ev.target.result as string); // Show preview
        }
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!selectedFile) return photo;

    const formData = new FormData();
    formData.append("file", selectedFile);

    const res = await fetch("/api/upload/user-photo", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed:", errorText);
      throw new Error("Image upload failed");
    }

    const data = await res.json();
    return data.filePath;
  };

  const updateProfile = async () => {
    if (!session?.user?.contact) {
      Swal.fire({
        title: "Missing Info",
        text: "User contact missing. Please login again.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }
  
    try {
      const photoPath = await uploadImage();
  
      const res = await fetch("/api/users/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact: session.user.contact,
          name,
          email,
          mobile,
          photo: photoPath,
        }),
      });
  
      if (res.ok) {
        await Swal.fire({
          title: "Profile Updated",
          text: "Your profile has been successfully updated.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload(); // ✅ Refresh only after user clicks OK
        });
        setPhoto(photoPath);
        setSelectedFile(null);
        setPreviewPhoto("");
        await loadProfile();
      } else {
        const errorText = await res.text();
        console.error("Update failed:", errorText);
        Swal.fire({
          title: "Update Failed",
          text: errorText || "Failed to update profile.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        title: "Error",
        text: "Something went wrong while uploading image or updating profile.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      <div className={styles.profileImage}>
      <div className={styles.imageUpload}>
          <div className={styles.imagePreview}>
            <img src={previewPhoto || "/images/profile.png"} alt="Profile Photo" />
            
          </div>
          <p className={styles.heading}>Profile Photo</p>
          <label className={styles.uploadLabel}>
            Upload Photo
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
        </div>

      </div>

      <div className={styles.profileInputs}>
      <div className={styles.formGroup}>
        <label>Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      </div>

      <div className={styles.formGroup}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      </div>

      <div className={styles.formGroup}>
        <label>Mobile</label>
        <input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" />
      </div>

      <button className={styles.button} onClick={updateProfile}>Update Profile</button>
      </div>
    </div>
  );
}
