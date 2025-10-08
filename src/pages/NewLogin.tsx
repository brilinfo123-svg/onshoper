"use client";

import React, { useState } from "react";
import styles from "@/styles/NewLogin.module.scss";
import { useRouter } from "next/router";

const LoginPage: React.FC = () => {
  const [loginType, setLoginType] = useState<"phone" | "email" | "">("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSendOtp = async () => {
    if (!contact) {
      setError("Please enter a valid mobile number or email.");
      return;
    }

    setError("");
    try {
      const res = await fetch("/api/Verification/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact }),
      });

      const data = await res.json();
      if (data.success) {
        setOtpSent(true);
        setMessage("OTP sent successfully.");
      } else {
        setError("Failed to send OTP.");
      }
    } catch {
      setError("Something went wrong.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setError("");
    try {
      const res = await fetch("/api/Verification/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp }),
      });

      const data = await res.json();
      if (data.user) {
        setMessage("Login successful!");
        setTimeout(() => router.push("/category"), 1000);
      } else {
        setError("Invalid OTP.");
      }
    } catch {
      setError("Verification failed.");
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
    <div className={styles.loginPage}>
      <div className={styles.loginBox}>
        <h2 className={styles.heading}>Login</h2>

        {!loginType && (
          <div className={styles.optionButtons}>
            <button onClick={() => setLoginType("phone")} className="icon-mobile">Continue with Phone</button>
            <button onClick={() => setLoginType("email")} className="icon-mail">Login with Email</button>
          </div>
        )}

        {loginType && !otpSent && (
          <div className={styles.inputGroup}>
            
            <label>{loginType === "phone" ? "Mobile Number" : "Email Address"}</label>
            <input
              type={loginType === "phone" ? "tel" : "email"}
              placeholder={loginType === "phone" ? "Enter mobile number" : "Enter email address"}
              value={contact}
              onChange={(e) => setContact(e.target.value)}
            />
            <button className={styles.primaryButton} onClick={handleSendOtp}>
              Send OTP
            </button>
            <button className={styles.backButton} onClick={handleBack}>← Back</button>
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
            <button className={styles.primaryButton} onClick={handleVerifyOtp}>
              Verify & Login
            </button>
            <button className={styles.backButton} onClick={handleBack}>← Back</button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
        {message && <p className={styles.success}>{message}</p>}
      </div>
    </div>
  );
};

export default LoginPage;
