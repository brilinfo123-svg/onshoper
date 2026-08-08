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

  // ✅ ID Upload states
  const [idType, setIdType] = useState("");
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);

  // ✅ Selfie states
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // ✅ Utility: Compress image before upload
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

          // ✅ Resize (reduce dimensions)
          const scale = 0.7; // 70% of original size
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          // ✅ Convert to JPEG with quality 0.7
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            }
          }, "image/jpeg", 0.7);
        };
      };
    });
  };

  // ✅ Open camera
  const openCamera = () => {
    setCapturedImage(null);
    setCameraActive(true);
  };

  // ✅ Capture selfie
  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCameraActive(false); // close camera after capture
    }
  };

  // ✅ Retake selfie
  const retakeSelfie = () => {
    setCapturedImage(null);
    setCameraActive(true); // reopen camera
  };

  
  // ✅ Submit Verification (ID + Selfie together)
// ✅ Helper: Convert File to base64
const toBase64 = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const submitVerification = async () => {
  if (!idType || !frontImage || !backImage || !capturedImage || !session?.user?.id) {
    Swal.fire({ icon: "error", title: "Error", text: "Please upload ID and capture selfie" });
    return;
  }

  // ✅ Compress + convert to base64
  const optimizedFront = await compressImage(frontImage);
  const optimizedBack = await compressImage(backImage);

  const frontBase64 = await toBase64(optimizedFront);
  const backBase64 = await toBase64(optimizedBack);

  const res = await fetch("/api/verification/submitDucuments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: session.user.id,   // ✅ same as SelfieVerificationModal
      idType,
      frontImage: frontBase64,
      backImage: backBase64,
      selfieImage: capturedImage, // already base64
    }),
  });

  const data = await res.json();

  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: "Verification Submitted",
      text: "Your documents and selfie are under review",
    }).then(() => onClose());
  } else {
    Swal.fire({ icon: "error", title: "Upload Failed", text: data.error || "Please try again" });
  }
};


  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Verification</h2>

        {/* ✅ ID Upload Section */}
        <div className={styles.section}>
          <h3><FaIdCard /> Upload Government ID</h3>
          <select className={styles.selectBox} onChange={(e) => setIdType(e.target.value)}>
            <option value="">Select ID Type</option>
            <option value="Aadhaar">Aadhaar</option>
            <option value="PAN">PAN</option>
            <option value="Passport">Passport</option>
            <option value="Driving License">Driving License</option>
          </select>
          <input type="file" className={styles.fileInput} onChange={(e) => setFrontImage(e.target.files?.[0] || null)} />
          <input type="file" className={styles.fileInput} onChange={(e) => setBackImage(e.target.files?.[0] || null)} />
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

        {/* ✅ Single Submit Button */}
        <div className={styles.actions}>
          <button className={styles.SubmitVerification} onClick={submitVerification}>Submit Verification</button>
          <button className={styles.closeBtn} onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
