"use client";

import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import styles from "@/styles/Login.module.scss";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"mobile" | "email" | "">("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const sendOtp = async () => {
    setError("");
    setMessage("");
    if (!contact) return setError(`Please enter your ${loginType}`);
  
    const res = await fetch("/api/Verification/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    });
  
    const data = await res.json();
  
    if (data.success) {
      setOtpSent(true);
      setMessage("OTP sent successfully");
  
      // ✅ Show OTP in alert for testing
      if (data.otp) {
        alert(`Your OTP is: ${data.otp}`);
      }
    } else {
      setError("Failed to send OTP");
    }
  };
  

  const verifyOtp = async () => {
    setError("");
    setMessage("");
    if (otp.length !== 6) return setError("Enter valid 6-digit OTP");
  
    const res = await fetch("/api/Verification/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, otp }),
    });
  
    const data = await res.json();
  
    if (data.user) {
      const result = await signIn("credentials", {
        redirect: false,
        contact,
      });
  
      if (result?.ok) {
        Swal.fire({
          icon: "success",
          title: "Login Successful",
          text: "Redirecting to Product Form...",
          timer: 2000,
          showConfirmButton: false,
        });
  
        setTimeout(() => router.push("/"), 2000);
      } else {
        setError("Login failed");
      }
    } else {
      setError("Invalid OTP");
    }
  };
  

  const handleBack = () => {
    setLoginType("");
    setContact("");
    setOtp("");
    setOtpSent(false);
    setError("");
    setMessage("");
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Login</h2>

      {!loginType && (
        <div className={styles.options}>
          <button
            onClick={() => setLoginType("mobile")}
            className={`${styles.mobileButton} ${styles.optionButton} ${"icon-mobile"}`}
          >
            Login with Mobile
          </button>
          OR
          <button
            onClick={() => setLoginType("email")}
            className={`${styles.emailButton} ${styles.optionButton} ${"icon-mail"}`}
          >
            Login with Email
          </button>
        </div>
      )}

      {loginType && !otpSent && (
        <div className={styles.inputGroup}>
          <label>{loginType === "mobile" ? "Mobile Number" : "Email Address"}</label>
          <input
              type={loginType === "mobile" ? "tel" : "email"}
              placeholder={loginType === "mobile" ? "Enter mobile number" : "Enter email address"}
              value={contact}
              onChange={(e) => {
                const value = e.target.value;
                if (loginType === "mobile") {
                  // Allow only digits
                  if (/^\d*$/.test(value)) {
                    setContact(value);
                    if (value.length > 0 && value.length !== 10) {
                      setError("Mobile number must be 10 digits");
                    } else {
                      setError("");
                    }
                  }
                } else {
                  setContact(value);
                  setError("");
                }
              }}
              maxLength={loginType === "mobile" ? 10 : undefined}
            />

          <button className={styles.button} onClick={sendOtp}>
            Send OTP
          </button>
          <button className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
        </div>
      )}

      {otpSent && (
        <div className={styles.inputGroup}>
          <label>Enter OTP</label>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
          <button className={styles.button} onClick={verifyOtp}>
            Verify OTP & Login
          </button>
          <button className={styles.backButton} onClick={handleBack}>
            ← Back
          </button>
        </div>
      )}

      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
    </div>
  );
}