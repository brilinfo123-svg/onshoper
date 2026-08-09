"use client";
import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { useSession } from "next-auth/react";
import Swal from "sweetalert2";
import styles from "./Index.module.scss";
import { FaIdCard, FaCamera } from "react-icons/fa";

export default function VerificationModal({ onClose }) {
  const { data: session } = useSession();
  const webcamRef = useRef<Webcam>(null);

  // ✅ States
  const [fullName, setFullName] = useState("");
  const [idType, setIdType] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Utility: Compress image
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const scale = 0.7;
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  // ✅ Camera controls
  const openCamera = () => {
    setCapturedImage(null);
    setCameraActive(true);
  };
  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraActive(false);
    }
  };
  const retakeSelfie = () => {
    setCapturedImage(null);
    setCameraActive(true);
  };

  // ✅ Helper: Convert File to base64
  const toBase64 = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  // ✅ Submit Verification
  const submitVerification = async () => {
    if (
      !fullName.trim() ||
      !idType ||
      !frontImage ||
      !backImage ||
      !capturedImage ||
      !session?.user?.id
    ) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Please enter your name, upload ID, and capture selfie.",
      });
      return;
    }

    if (submitting) return;

    try {
      setSubmitting(true);
      Swal.fire({
        title: "Submitting Verification...",
        text: "Please wait while we upload and verify your documents.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => Swal.showLoading(),
      });

      const optimizedFront = await compressImage(frontImage);
      const optimizedBack = await compressImage(backImage);
      const frontBase64 = await toBase64(optimizedFront);
      const backBase64 = await toBase64(optimizedBack);

      const res = await fetch("/api/verification/submitDucuments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session.user.id,
          name: fullName, // ✅ Added name
          idType,
          frontImage: frontBase64,
          backImage: backBase64,
          selfieImage: capturedImage,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit verification");

      setSubmitting(false);
      await Swal.fire({
        icon: "success",
        title: "Verification Submitted",
        text: "Your documents and selfie are under review.",
        confirmButtonText: "OK",
        confirmButtonColor: "#16a34a",
      });
      window.location.reload();
    } catch (error) {
      console.error("Verification submission error:", error);
      setSubmitting(false);
      Swal.close();
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Verification</h2>

        {/* ✅ Name Field */}
        <div className={`${styles.section} ${styles.NameOfDocumet}`}>
          <label className={styles.inputLabel}>Name as per document</label>
          <input
            type="text"
            className={styles.textInput}
            placeholder="Enter your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        {/* ✅ ID Upload Section */}
        <div className={styles.section}>
          <h3><FaIdCard /> Upload Government ID</h3>
          {/* <label className={styles.inputLabel}>ID Type</label> */}
          <select
            className={styles.selectBox}
            value={idType}
            onChange={(e) => setIdType(e.target.value)}
          >
            <option value="">Select ID Type</option>
            <option value="Aadhaar">Aadhaar</option>
            <option value="PAN">PAN</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
          </select>

          {/* Front Image */}
          <div className={styles.fileUploadBox}>
            <label className={styles.inputLabel}><FaIdCard /> ID Front Side</label>
            <p className={styles.inputHint}>Upload the front side of your government ID.</p>
            <input
              type="file"
              className={styles.fileInput}
              accept="image/*"
              onChange={(e) => setFrontImage(e.target.files?.[0] || null)}
            />
            {frontImage && <span className={styles.fileSelected}>✓ {frontImage.name}</span>}
          </div>

          {/* Back Image */}
          <div className={styles.fileUploadBox}>
            <label className={styles.inputLabel}><FaIdCard /> ID Back Side</label>
            <p className={styles.inputHint}>Upload the back side of your government ID.</p>
            <input
              type="file"
              className={styles.fileInput}
              accept="image/*"
              onChange={(e) => setBackImage(e.target.files?.[0] || null)}
            />
            {backImage && <span className={styles.fileSelected}>✓ {backImage.name}</span>}
          </div>
        </div>

        {/* ✅ Selfie Section */}
        <div className={styles.section}>
          <h3 className={styles.CaptureSelfie}><FaCamera /> Capture Selfie</h3>
          {cameraActive ? (
            <div className={styles.videoBox}>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png"
                width="100%"
                height={300}
                videoConstraints={{ facingMode: "user" }}
              />
              <div className={styles.actions}>
                <button className={`${styles.button} ${styles.Capture}`} onClick={captureSelfie}>Capture</button>
                <button className={styles.closeBtn} onClick={() => setCameraActive(false)}>Cancel</button>
              </div>
            </div>
          ) : capturedImage ? (
            <div className={styles.previewBox}>
              <img src={capturedImage} alt="Captured Selfie" />
              <div className={styles.actions}>
                <button className={styles.closeBtn} onClick={retakeSelfie}>Retake</button>
              </div>
            </div>
          ) : (
            <button className={`${styles.button} ${styles.OpenCamera}`} onClick={openCamera}>Open Camera</button>
          )}
        </div>

        {/* ✅ Submit + Close */}
        <div className={styles.actions}>
          <button
            className={styles.SubmitVerification}
            onClick={submitVerification}
            disabled={submitting}
          >
            {submitting ? <><span className={styles.spinner}></span>Submitting...</> : "Submit Verification"}
          </button>
          <button className={styles.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
