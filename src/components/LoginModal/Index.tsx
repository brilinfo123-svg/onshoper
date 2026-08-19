"use client";

import React, { useEffect, useRef, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./Index.module.scss";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  const { status } = useSession();
  const router = useRouter();

  const [loginType, setLoginType] = useState<"mobile" | "email" | "">("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // -----------------------------
  // Email validation
  // -----------------------------

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // -----------------------------
  // Reset modal
  // -----------------------------

  const resetLogin = () => {
    setLoginType("");
    setContact("");
    setOtp("");
    setOtpSent(false);
    setError("");
    setMessage("");
    setTimer(0);
    setCanResend(false);
    setIsSendingOtp(false);
    setIsVerifying(false);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  // -----------------------------
  // Close modal
  // -----------------------------

  const handleClose = () => {
    resetLogin();
    onClose();
  };

  // -----------------------------
  // Countdown
  // -----------------------------

  useEffect(() => {
    if (!otpSent || timer <= 0) return;

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCanResend(true);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [otpSent, timer]);

  // -----------------------------
  // Get OTP expiry
  // -----------------------------

  const fetchOtpExpiry = async () => {
    try {
      const res = await fetch("/api/verification/get-expiry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact,
          loginType,
        }),
      });

      const data = await res.json();

      if (data.expiresAt) {
        const expiryTime = new Date(data.expiresAt).getTime();
        const now = Date.now();

        const secondsLeft = Math.max(
          Math.floor((expiryTime - now) / 1000),
          0
        );

        setTimer(secondsLeft);
        setCanResend(secondsLeft === 0);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
              }

              setCanResend(true);
              return 0;
            }

            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error("OTP expiry error:", error);
    }
  };

  // -----------------------------
  // Send OTP
  // -----------------------------

  const sendOtp = async () => {
    setError("");
    setMessage("");
    setIsSendingOtp(true);

    try {
      if (!contact) {
        setError(`Please enter your ${loginType}`);
        return;
      }

      if (loginType === "mobile" && contact.length !== 10) {
        setError("Mobile number must be 10 digits");
        return;
      }

      if (loginType === "email" && !validateEmail(contact)) {
        setError("Enter a valid email address");
        return;
      }

      const endpoint =
        loginType === "email"
          ? "/api/verification/send-email-otp"
          : "/api/verification/send-otp";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact,
          loginType,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setOtpSent(true);

        if (loginType === "mobile") {
          setMessage("OTP sent on WhatsApp");
        } else {
          setMessage("OTP sent to your email");
        }

        setCanResend(false);

        await fetchOtpExpiry();
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Send OTP error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  // -----------------------------
  // Verify OTP
  // -----------------------------

  const verifyOtp = async () => {
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch("/api/verification/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact,
          otp,
          loginType,
        }),
      });

      const data = await res.json();

      if (!data.user) {
        setError("Invalid OTP");
        return;
      }

      const result = await signIn("credentials", {
        redirect: false,
        contact,
      });

      if (!result?.ok) {
        setError("Login failed");
        return;
      }

      // -----------------------------
      // Generate FCM token
      // -----------------------------

      import("@/lib/firebase").then(async ({ generateToken }) => {
        try {
          const token = await generateToken();

          if (token) {
            await fetch("/api/saveToken", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userId: data.user._id,
                contact: data.user.contact,
                token,
                device: "web",
              }),
            });
          }
        } catch (error) {
          console.error("FCM token error:", error);
        }
      });

      await Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "You are now logged in.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });

      handleClose();

      // If you want to redirect after login
      router.push("/ProductForm");

    } catch (error) {
      console.error("Verification error:", error);
      setError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  // -----------------------------
  // Back
  // -----------------------------

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

  // -----------------------------
  // Countdown format
  // -----------------------------

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };


  useEffect(() => {
    if (!isOpen) return;
  
    const scrollY = window.scrollY;
  
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.overflow = "hidden";
  
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
  
      window.scrollTo(0, scrollY);
    };
  }, [isOpen]);
  // -----------------------------
  // Don't render
  // -----------------------------

  if (!isOpen) return null;

  // -----------------------------
  // Already logged in
  // -----------------------------

  if (status === "authenticated") {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className={styles.modal}>

        {/* Close button */}

        <button
          type="button"
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Close login"
        >
          ×
        </button>

        {/* Header */}

        <div className={styles.header}>
          <h2>Login</h2>

          <p>
            Login to continue to your account
          </p>
        </div>

        {/* Login options */}

        {!loginType && (
          <div className={styles.options}>

            <button
              type="button"
              className={styles.optionButton}
              onClick={() => setLoginType("email")}
            >
              <span className={`${styles.icon} ${"icon-mail"}`}></span>

              <span>
                <strong>Login with Email</strong>
                <small>Receive OTP on your email</small>
              </span>

              <span className={styles.arrow}>→</span>
            </button>

            {/*
            Mobile login can be enabled later:

            <button
              type="button"
              className={styles.optionButton}
              onClick={() => setLoginType("mobile")}
            >
              <span className={styles.icon}>📱</span>

              <span>
                <strong>Login with Mobile</strong>
                <small>Receive OTP on WhatsApp</small>
              </span>

              <span className={styles.arrow}>→</span>
            </button>
            */}
          </div>
        )}

        {/* Contact */}

        {loginType && !otpSent && (
          <div className={styles.form}>

            <label>
              {loginType === "mobile"
                ? "Mobile Number"
                : "Email Address"}
            </label>

            <input
              type={loginType === "mobile" ? "tel" : "email"}
              placeholder={
                loginType === "mobile"
                  ? "Enter mobile number"
                  : "Enter email address"
              }
              value={contact}
              maxLength={
                loginType === "mobile"
                  ? 10
                  : undefined
              }
              onChange={(e) => {
                const value = e.target.value;

                if (loginType === "mobile") {
                  if (!/^\d*$/.test(value)) return;

                  setContact(value);

                  if (
                    value.length > 0 &&
                    value.length !== 10
                  ) {
                    setError(
                      "Mobile number must be 10 digits"
                    );
                  } else {
                    setError("");
                  }
                } else {
                  setContact(value);

                  if (
                    value.length > 0 &&
                    !validateEmail(value)
                  ) {
                    setError(
                      "Enter a valid email address"
                    );
                  } else {
                    setError("");
                  }
                }
              }}
            />

            <button
              type="button"
              className={styles.primaryButton}
              onClick={sendOtp}
              disabled={isSendingOtp}
            >
              {isSendingOtp
                ? "Sending..."
                : "Send OTP"}
            </button>

            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back
            </button>
          </div>
        )}

        {/* OTP */}

        {otpSent && (
          <div className={styles.form}>

            <div className={styles.otpInfo}>
              <span>
                OTP sent to
              </span>

              <strong>
                {contact}
              </strong>
            </div>

            <label>
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              maxLength={6}
              onChange={(e) => {
                const value = e.target.value;

                if (/^\d*$/.test(value)) {
                  setOtp(value);
                }
              }}
            />

            <button
              type="button"
              className={styles.primaryButton}
              onClick={verifyOtp}
              disabled={isVerifying}
            >
              {isVerifying
                ? "Verifying..."
                : "Verify OTP & Login"}
            </button>

            <button
              type="button"
              className={styles.backButton}
              onClick={handleBack}
            >
              ← Back
            </button>

            {!canResend ? (
              <p className={styles.timerText}>
                Resend available in{" "}
                <strong>
                  {formatCountdown(timer)}
                </strong>
              </p>
            ) : (
              <button
                type="button"
                className={styles.resendButton}
                onClick={sendOtp}
                disabled={isSendingOtp}
              >
                {isSendingOtp
                  ? "Sending..."
                  : "Resend OTP"}
              </button>
            )}
          </div>
        )}

        {/* Error */}

        {error && (
          <p className={`${styles.message} ${styles.error}`}>
            {error}
          </p>
        )}

        {/* Success */}

        {message && (
          <p
            className={`${styles.message} ${styles.success}`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}