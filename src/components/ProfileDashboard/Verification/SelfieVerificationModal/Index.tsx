"use client";
import { useRef, useState, useEffect } from "react";
import Webcam from "react-webcam";
import { useSession } from "next-auth/react"; 
import styles from "./Index.module.scss";
import Swal from "sweetalert2";

export default function SelfieVerificationModal({ onClose }) {
  const { data: session } = useSession(); 
  const webcamRef = useRef<Webcam>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingCamera, setLoadingCamera] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoadingCamera(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Capture selfie (base64 string)
  const captureSelfie = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) setCapturedImage(imageSrc);
  };

  // ✅ Submit selfie (send base64 string to API)
  const submitSelfie = async () => {
    if (!capturedImage || !session?.user?.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "User not logged in or selfie missing",
      });
      return;
    }

    const res = await fetch("/api/verification/uploadSelfie", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        selfieImage: capturedImage,
        userId: session.user.id, // ✅ real ObjectId from session
      }),
    });

    const data = await res.json();

    if (res.ok && data.record?.selfieImage) {
      Swal.fire({
        icon: "success",
        title: "Selfie Submitted",
        html: `<img src="${data.record.selfieImage}" 
                   alt="Uploaded Selfie" 
                   style="max-width:100%;border-radius:8px;margin-top:10px;" />`,
        confirmButtonText: "OK",
      }).then(() => onClose());
    } else {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: data.error || "Please try again.",
      });
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Face should be clear</h2>

        {loadingCamera ? (
          <div className={styles.loaderBox}>
            <div className={styles.loader}></div>
            <p>Initializing camera...</p>
          </div>
        ) : !capturedImage ? (
          <div className={styles.videoBox}>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/png"
              width="100%"
              height={450}
              videoConstraints={{ facingMode: "user" }}
            />
          </div>
        ) : (
          <div className={styles.previewBox}>
            <img src={capturedImage} alt="Captured Selfie" />
          </div>
        )}

        <div className={styles.actions}>
          {!capturedImage ? (
            <button className={styles.button} onClick={captureSelfie}>
              Capture Selfie
            </button>
          ) : (
            <>
              <button className={styles.button} onClick={submitSelfie}>
                Submit Selfie
              </button>
              <button className={styles.closeBtn} onClick={() => setCapturedImage(null)}>
                Retake
              </button>
            </>
          )}
          <button className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
