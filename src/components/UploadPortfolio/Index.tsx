"use client";
import React, { useState, useEffect } from "react";
import styles from "@/components/UpdateDetail/Index.module.scss";
import { useRouter } from "next/router";

const Index: React.FC<{ initialData?: any }> = ({ initialData }) => {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    portfolioImages: [] as File[],
  });
  

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        ...initialData,
      }));
      if (initialData.portfolioImages) {
        setImagePreviews(
          initialData.portfolioImages.map((file: File) =>
            URL.createObjectURL(file)
          )
        );
      }
    }
  }, [initialData]);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        portfolioImages: [...prev.portfolioImages, ...files],
      }));
      setImagePreviews((prev) => [
        ...prev,
        ...files.map((file) => URL.createObjectURL(file)),
      ]);
    }
  };



  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      // Update logic
      console.log("Updating Data", formData);
    } else {
      // Create logic
      console.log("Creating Data", formData);
    }
    // Add API call or logic to handle form submission
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>


          <div className={styles.step}>
           
            <div className={`${styles.formGroup} ${styles.formGroupImg}`}>
              <label className={styles.uploadImg} htmlFor="portfolioImages">
                <span className="icon-upload-cloud-outline"></span> Upload Portfolio Images
              </label>
              <input
                type="file"
                name="portfolioImages"
                accept="image/*"
                multiple
                id="portfolioImages"
                onChange={handleFileChange}
              />
            </div>

            <div className={styles.imagePreviewContainer}>
              {imagePreviews.map((preview, index) => (
                <div key={index} className={styles.imagePreview}>
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <div
                    className={styles.removePreview}
                    onClick={() => {
                      const updatedPreviews = imagePreviews.filter(
                        (_, i) => i !== index
                      );
                      setImagePreviews(updatedPreviews);
                      const updatedFiles = formData.portfolioImages.filter(
                        (_, i) => i !== index
                      );
                      setFormData((prev) => ({
                        ...prev,
                        portfolioImages: updatedFiles,
                      }));
                    }}
                  >
                    &times;
                  </div>
                </div>
              ))}
              {imagePreviews.length > 0 && (
                <button
                  type="button"
                  className={styles.uploadMoreButton}
                  onClick={() =>
                    document.getElementById("portfolioImages")?.click()
                  }
                >
                  <span className="icon-plus"></span>
                </button>
              )}
            </div>
          </div>

        <div className={styles.buttonGroup}>
          <button type="submit" className={styles.submitButton}>Submit</button>
        </div>
      </form>
    </>
  );
};

export default Index;
