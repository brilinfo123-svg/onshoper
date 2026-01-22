"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import styles from "@/styles/login.module.scss";
import Swal from "sweetalert2";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [loginType, setLoginType] = useState<"mobile" | "email" | "">("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);


  // ✅ Email validation helper
  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // ✅ Countdown effect
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
      body: JSON.stringify({ contact, loginType }),
    });

    const data = await res.json();

    if (data.expiresAt) {
      const expiryTime = new Date(data.expiresAt).getTime();
      const now = Date.now();
      const secondsLeft = Math.max(Math.floor((expiryTime - now) / 1000), 0);

      setTimer(secondsLeft);
      setCanResend(secondsLeft === 0);

      if (intervalRef.current) clearInterval(intervalRef.current);

      intervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
  
    // ✅ Validate before sending
    if (loginType === "mobile" && contact.length !== 10) {
      setError("Mobile number must be 10 digits");
      setIsSendingOtp(false);
      return;
    }
    if (loginType === "email" && !validateEmail(contact)) {
      setError("Enter a valid email address");
      setIsSendingOtp(false);
      return;
    }
  
    // ✅ Decide API endpoint based on loginType
    const endpoint =
      loginType === "email"
        ? "/api/Verification/send-email-otp"
        : "/api/Verification/send-otp";
  
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact, loginType }),
    });
  
    const data = await res.json();
    if (data.success) {
      setOtpSent(true);
      // ✅ Different messages for mobile vs email
      if (loginType === "mobile") {
        setMessage("✅ OTP sent on WhatsApp");
      } else {
        setMessage("✅ OTP sent to your email");
      }
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
  
    if (otp.length !== 6) {
      return setError("Enter valid 6-digit OTP");
    }
  
    setIsVerifying(true); // 👈 start loader
  
    try {
      const res = await fetch("/api/Verification/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contact, otp, loginType }),
      });
  
      const data = await res.json();
  
      if (data.user) {
        const result = await signIn("credentials", {
          redirect: false,
          contact,
        });
  
        if (result?.ok) {
          // ✅ Generate FCM token
          import("@/lib/firebase").then(async ({ generateToken }) => {
            const token = await generateToken();
            if (token) {
              await fetch("/api/saveToken", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: data.user._id,       // 👈 Mongo _id
                  contact: data.user.contact,  // 👈 mobile/email from user object
                  token,
                  device: "web"                // 👈 optional, default "web"
                }),
              });
              console.log("✅ FCM token saved in DB:", token);
            }
          });
  
          Swal.fire({
            icon: "success",
            title: "Login Successful",
            text: "Click OK to go to Product Form",
            confirmButtonText: "OK",
            allowOutsideClick: false,
          }).then((result) => {
            if (result.isConfirmed) {
              router.push("/ProductForm");
            }
          });
        } else {
          setError("Login failed");
        }
      } else {
        setError("Invalid OTP");
      }
    } catch (err) {
      console.error("❌ Verification error:", err);
      setError("Verification failed");
    } finally {
      setIsVerifying(false); // 👈 stop loader always
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
      {status === "loading" ? (
        <p>Loading...</p>
      ) : status === "authenticated" ? (
        <p>Redirecting...</p>
      ) : (
        <div className={styles.container}>
          <h2 className={styles.heading}>Login</h2>
          {!loginType && (
            <div className={styles.options}>
              {/* <button
                onClick={() => setLoginType("mobile")}
                className={`${styles.mobileButton} ${styles.optionButton} icon-mobile`}
              >
                Login with Mobile
              </button>
              OR */}
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
              <label>
                {loginType === "mobile" ? "Mobile Number" : "Email Address"}
              </label>
              <input
                type={loginType === "mobile" ? "tel" : "email"}
                placeholder={
                  loginType === "mobile"
                    ? "Enter mobile number"
                    : "Enter email address"
                }
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
                    if (value.length > 0 && !validateEmail(value)) {
                      setError("Enter a valid email address");
                    } else {
                      setError("");
                    }
                  }
                }}
                maxLength={loginType === "mobile" ? 10 : undefined}
              />
              <button
                className={styles.button}
                onClick={sendOtp}
                disabled={isSendingOtp}
              >
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
              <button className={styles.button} onClick={verifyOtp} disabled={isVerifying}>
              {isVerifying ? (
                <span className={styles.loaderOTP}>Verifying...</span>
              ) : (
                "Verify OTP & Login"
              )}
            </button>

              <button className={styles.backButton} onClick={handleBack}>
                ← Back
              </button>
              {!canResend ? (
                <p className={styles.timerText}>
                  Resend available in {formatCountdown(timer)}
                </p>
              ) : (
                <button className={styles.resendButton} onClick={sendOtp}>
                  Resend OTP
                </button>
              )}
            </div>
          )}

          {error && (
            <p className={`${styles.message} ${styles.error}`}>{error}</p>
          )}
          {message && (
            <p className={`${styles.message} ${styles.success}`}>{message}</p>
          )}
        </div>
      )}
    </div>
  );
}
