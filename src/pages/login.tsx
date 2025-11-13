"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import styles from "@/styles/login.module.scss";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [loginType, setLoginType] = useState<"mobile" | "email" | "">("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const router = useRouter();

  useEffect(() => {
    let countdown: NodeJS.Timeout;
    if (otpSent && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  const fetchOtpExpiry = async () => {
    const res = await fetch("/api/Verification/get-expiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    });

    const data = await res.json();

    if (data.expiresAt) {
      const expiryTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const secondsLeft = Math.max(Math.floor((expiryTime - now) / 1000), 0);
      setTimer(secondsLeft);
      setCanResend(secondsLeft === 0);
    }
  };

  const sendOtp = async () => {
    setError("");
    setMessage("");
    setIsSendingOtp(true);
  
    if (!contact) {
      setError(`Please enter your ${loginType}`);
      setIsSendingOtp(false);
      return;
    }
  
    const res = await fetch("/api/Verification/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    });
  
    const data = await res.json();
  
    if (data.success) {
      setOtpSent(true);
      alert(`Your OTP is: ${data.otp}`);
      setMessage("OTP sent successfully");
      setCanResend(false);
      await fetchOtpExpiry();
    } else {
      setError("Failed to send OTP");
    }
  
    setIsSendingOtp(false);
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
    setTimer(0);
    setCanResend(false);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };
  
  return (

    <div className={styles.loginWrapper}>
    <div className={styles.container}>
      <h2 className={styles.heading}>Login</h2>

      {!loginType && (
        <div className={styles.options}>
          <button
            onClick={() => setLoginType("mobile")}
            className={`${styles.mobileButton} ${styles.optionButton} icon-mobile`}
          >
            Login with Mobile
          </button>
          OR
          <button
            onClick={() => setLoginType("email")}
            className={`${styles.emailButton} ${styles.optionButton} icon-mail`}
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

          <button className={styles.button} onClick={sendOtp} disabled={isSendingOtp}>
            {isSendingOtp ? (
              <span className={styles.loaderOTP}>Sending...</span>
            ) : (
              "Send OTP"
            )}
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

          {!canResend ? (
           <p className={styles.timerText}>Resend available in {formatCountdown(timer)}</p>

          ) : (
            <button className={styles.resendButton} onClick={sendOtp}>
              Resend OTP
            </button>
          )}
        </div>
      )}

      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      {message && <p className={`${styles.message} ${styles.success}`}>{message}</p>}
    </div>
    </div>
  );
}
