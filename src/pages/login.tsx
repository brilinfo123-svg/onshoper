"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import styles from "@/styles/login.module.scss";
import Swal from "sweetalert2";
import LoginSkeleton from "@/components/Login/LoginSkeleton/Index";

export default function LoginPage() {
  const { data: session, status } = useSession();

  const [loginType, setLoginType] = useState<
    "mobile" | "email" | ""
  >("");

  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  // =====================================================
  // NEW MOBILE STEP
  // =====================================================

  const [showMobileStep, setShowMobileStep] = useState(false);
  const [mobileNumber, setMobileNumber] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [timer, setTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // =====================================================
  // EMAIL VALIDATION
  // =====================================================

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // =====================================================
  // COUNTDOWN
  // =====================================================

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

  // =====================================================
  // OTP EXPIRY
  // =====================================================

  const fetchOtpExpiry = async () => {
    const res = await fetch(
      "/api/verification/get-expiry",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contact,
          loginType,
        }),
      }
    );

    const data = await res.json();

    if (data.expiresAt) {
      const expiryTime = new Date(
        data.expiresAt
      ).getTime();

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
  };

  // =====================================================
  // SEND OTP
  // =====================================================

  const sendOtp = async () => {
    setError("");
    setMessage("");
    setIsSendingOtp(true);

    if (!contact) {
      setError(`Please enter your ${loginType}`);
      setIsSendingOtp(false);
      return;
    }

    // Mobile validation
    if (
      loginType === "mobile" &&
      contact.length !== 10
    ) {
      setError("Mobile number must be 10 digits");
      setIsSendingOtp(false);
      return;
    }

    // Email validation
    if (
      loginType === "email" &&
      !validateEmail(contact)
    ) {
      setError("Enter a valid email address");
      setIsSendingOtp(false);
      return;
    }

    try {
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
          setMessage("✅ OTP sent on WhatsApp");
        } else {
          setMessage("✅ OTP sent to your email");
        }

        setCanResend(false);

        await fetchOtpExpiry();
      } else {
        setError(
          data.message || "Failed to send OTP"
        );
      }
    } catch (error) {
      console.error("Send OTP error:", error);

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  // =====================================================
  // VERIFY OTP
  // =====================================================

  const verifyOtp = async () => {
    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Enter valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);

    try {
      const res = await fetch(
        "/api/verification/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact,
            otp,
            loginType,
          }),
        }
      );

      const data = await res.json();

      if (!data.user) {
        setError("Invalid OTP");
        return;
      }

      // =================================================
      // EMAIL VERIFIED
      // NOW SHOW MOBILE NUMBER
      // =================================================

      if (loginType === "email") {
        // Email successfully verified
        setVerifiedEmail(contact);
      
        // Mobile number ko DB se automatically submit nahi karna.
        // Agar existing mobile hai to input mein show kar sakte hain.
        setMobileNumber(data.user.mobile || "");
      
        // Mobile step show karo
        setShowMobileStep(true);
      
        // OTP screen hide karo
        setOtpSent(false);
      
        // OTP clear karo
        setOtp("");
      
        setError("");
      
        setMessage(
          "Email verified. Please enter your mobile number and click Continue."
        );
      
        // IMPORTANT:
        // Yahin se function stop hoga.
        // Mobile tabhi save hoga jab user Continue button click karega.
        return;
      }

      // =================================================
      // MOBILE LOGIN
      // Existing mobile login flow
      // =================================================

      const result = await signIn(
        "credentials",
        {
          redirect: false,
          contact,
        }
      );

      if (!result?.ok) {
        setError("Login failed");
        return;
      }

      // =================================================
      // FCM TOKEN
      // =================================================

      import("@/lib/firebase").then(
        async ({ generateToken }) => {
          try {
            const token =
              await generateToken();

            if (token) {
              await fetch(
                "/api/saveToken",
                {
                  method: "POST",
                  headers: {
                    "Content-Type":
                      "application/json",
                  },
                  body: JSON.stringify({
                    userId: data.user._id,
                    contact:
                      data.user.contact,
                    token,
                    device: "web",
                  }),
                }
              );
            }
          } catch (error) {
            console.error(
              "FCM token error:",
              error
            );
          }
        }
      );

      // =================================================
      // SUCCESS
      // =================================================

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

    } catch (err) {
      console.error(
        "❌ Verification error:",
        err
      );

      setError("Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  // =====================================================
  // NEW: SUBMIT MOBILE NUMBER
  // =====================================================

  const submitMobile = async () => {
    setError("");
    setMessage("");
  
    // ============================================
    // MOBILE REQUIRED
    // ============================================
  
    if (!mobileNumber) {
      setError("Please enter your mobile number");
      return;
    }
  
    // ============================================
    // ONLY DIGITS
    // ============================================
  
    if (!/^\d+$/.test(mobileNumber)) {
      setError("Mobile number must contain digits only");
      return;
    }
  
    // ============================================
    // EXACTLY 10 DIGITS
    // ============================================
  
    if (mobileNumber.length !== 10) {
      setError("Mobile number must be 10 digits");
      return;
    }
  
    // ============================================
    // VALID INDIAN MOBILE NUMBER
    // ============================================
  
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      setError(
        "Please enter a valid 10-digit mobile number"
      );
      return;
    }
  
    // ============================================
    // EMAIL MUST BE VERIFIED
    // ============================================
  
    if (!verifiedEmail) {
      setError("Please verify your email first");
      return;
    }
  
    try {
      setIsVerifying(true);
  
      // ============================================
      // ONLY HERE MOBILE IS SUBMITTED TO DB
      // ============================================
  
      const profileRes = await fetch(
        "/api/users/profile",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contact: verifiedEmail,
            mobile: mobileNumber,
          }),
        }
      );
  
      const profileData =
        await profileRes.json();
  
      if (
        !profileRes.ok ||
        !profileData.success
      ) {
        setError(
          profileData.message ||
            profileData.error ||
            "Failed to save mobile number"
        );
  
        return;
      }
  
      // ============================================
      // MOBILE SUCCESSFULLY SAVED
      // NOW LOGIN
      // ============================================
  
      const result = await signIn(
        "credentials",
        {
          redirect: false,
          contact: verifiedEmail,
        }
      );
  
      if (!result?.ok) {
        setError("Login failed");
        return;
      }
  
      // ============================================
      // SUCCESS
      // ============================================
  
      Swal.fire({
        icon: "success",
        title: "Login Successful",
        text: "Your email and mobile number have been saved.",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          router.push("/ProductForm");
        }
      });
  
    } catch (error) {
      console.error(
        "Mobile update error:",
        error
      );
  
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // =====================================================
  // BACK
  // =====================================================

  const handleBack = () => {

    // If mobile step is open
    if (showMobileStep) {
      setShowMobileStep(false);

      setMobileNumber("");
      setVerifiedEmail("");

      setError("");
      setMessage("");

      // Go back to OTP
      setOtpSent(true);

      return;
    }

    setLoginType("");
    setContact("");
    setOtp("");
    setOtpSent(false);

    setError("");
    setMessage("");

    setTimer(0);
    setCanResend(false);
  };

  // =====================================================
  // COUNTDOWN FORMAT
  // =====================================================

  const formatCountdown = (
    seconds: number
  ) => {
    const mins = Math.floor(
      seconds / 60
    );

    const secs = seconds % 60;

    return `${mins}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className={styles.loginWrapper}>
      {status === "loading" ? (
        <LoginSkeleton />
      ) : status === "authenticated" ? (
        <p>Redirecting...</p>
      ) : (
        <div className={styles.container}>

          <h2 className={styles.heading}>
            Login
          </h2>

          {/* ================================================= */}
          {/* LOGIN OPTIONS */}
          {/* ================================================= */}

          {!loginType && (
            <div className={styles.options}>

              {/* Mobile login can be enabled later */}

              {/*
              <button
                onClick={() =>
                  setLoginType("mobile")
                }
                className={`${styles.mobileButton} ${styles.optionButton} icon-mobile`}
              >
                Login with Mobile
              </button>
              */}

              <button
                onClick={() =>
                  setLoginType("email")
                }
                className={`${styles.emailButton} ${styles.optionButton} icon-mail`}
              >
                Login with Email
              </button>

            </div>
          )}

          {/* ================================================= */}
          {/* EMAIL / MOBILE INPUT */}
          {/* ================================================= */}

          {loginType &&
            !otpSent &&
            !showMobileStep && (
              <div
                className={
                  styles.inputGroup
                }
              >

                <label>
                  {loginType === "mobile"
                    ? "Mobile Number"
                    : "Email Address"}
                </label>

                <input
                  type={
                    loginType === "mobile"
                      ? "tel"
                      : "email"
                  }
                  placeholder={
                    loginType === "mobile"
                      ? "Enter mobile number"
                      : "Enter email address"
                  }
                  value={contact}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    if (
                      loginType ===
                      "mobile"
                    ) {
                      if (
                        /^\d*$/.test(
                          value
                        )
                      ) {
                        setContact(
                          value
                        );

                        if (
                          value.length >
                            0 &&
                          value.length !==
                            10
                        ) {
                          setError(
                            "Mobile number must be 10 digits"
                          );
                        } else {
                          setError("");
                        }
                      }
                    } else {
                      setContact(value);

                      if (
                        value.length >
                          0 &&
                        !validateEmail(
                          value
                        )
                      ) {
                        setError(
                          "Enter a valid email address"
                        );
                      } else {
                        setError("");
                      }
                    }
                  }}
                  maxLength={
                    loginType ===
                    "mobile"
                      ? 10
                      : undefined
                  }
                />

                <button
                  className={styles.button}
                  onClick={sendOtp}
                  disabled={
                    isSendingOtp
                  }
                >
                  {isSendingOtp ? (
                    <span
                      className={
                        styles.loaderOTP
                      }
                    >
                      Sending...
                    </span>
                  ) : (
                    "Send OTP"
                  )}
                </button>

                <button
                  className={
                    styles.backButton
                  }
                  onClick={
                    handleBack
                  }
                >
                  ← Back
                </button>

              </div>
            )}

          {/* ================================================= */}
          {/* MOBILE NUMBER STEP */}
          {/* ================================================= */}

          {showMobileStep && (
            <div
              className={
                styles.inputGroup
              }
            >

              <div
                className={
                  styles.otpInfo
                }
              >
                <span>
                  Email verified
                </span>

                <strong>
                  {verifiedEmail}
                </strong>
              </div>

              <label>
                Mobile Number
              </label>

              <input
                type="tel"
                inputMode="numeric"
                placeholder="Enter mobile number"
                value={mobileNumber}
                maxLength={10}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  if (
                    !/^\d*$/.test(
                      value
                    )
                  ) {
                    return;
                  }

                  setMobileNumber(
                    value
                  );

                  if (
                    value.length >
                      0 &&
                    value.length !==
                      10
                  ) {
                    setError(
                      "Mobile number must be 10 digits"
                    );
                  } else {
                    setError("");
                  }
                }}
              />

              <button
                className={
                  styles.button
                }
                onClick={
                  submitMobile
                }
                disabled={
                  isVerifying
                }
              >
                {isVerifying ? (
                  <span
                    className={
                      styles.loaderOTP
                    }
                  >
                    Saving...
                  </span>
                ) : (
                  "Continue"
                )}
              </button>

              <button
                className={
                  styles.backButton
                }
                onClick={
                  handleBack
                }
              >
                ← Back
              </button>

            </div>
          )}

          {/* ================================================= */}
          {/* OTP */}
          {/* ================================================= */}

          {otpSent &&
            !showMobileStep && (
              <div
                className={
                  styles.inputGroup
                }
              >

                <label>
                  Enter OTP
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit OTP"
                  value={otp}
                  onChange={(e) => {
                    const value =
                      e.target.value;

                    if (
                      /^\d*$/.test(
                        value
                      )
                    ) {
                      setOtp(
                        value
                      );
                    }
                  }}
                  maxLength={6}
                />

                <button
                  className={
                    styles.button
                  }
                  onClick={
                    verifyOtp
                  }
                  disabled={
                    isVerifying
                  }
                >
                  {isVerifying ? (
                    <span
                      className={
                        styles.loaderOTP
                      }
                    >
                      Verifying...
                    </span>
                  ) : (
                    "Verify OTP"
                  )}
                </button>

                <button
                  className={
                    styles.backButton
                  }
                  onClick={
                    handleBack
                  }
                >
                  ← Back
                </button>

                {!canResend ? (
                  <p
                    className={
                      styles.timerText
                    }
                  >
                    Resend available
                    in <span>{" "}
                    {formatCountdown(
                      timer
                    )}</span>
                  </p>
                ) : (
                  <button
                    className={
                      styles.resendButton
                    }
                    onClick={
                      sendOtp
                    }
                    disabled={
                      isSendingOtp
                    }
                  >
                    Resend OTP
                  </button>
                )}

              </div>
            )}

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <p
              className={`${styles.message} ${styles.error}`}
            >
              {error}
            </p>
          )}

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {message && (
            <p
              className={`${styles.message} ${styles.success}`}
            >
              {message}
            </p>
          )}

        </div>
      )}
    </div>
  );
}