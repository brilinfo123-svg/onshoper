"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // For redirection
import styles from "@/styles/register.module.scss";

const RegistrationForm: React.FC = () => {


  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    otp: "", // OTP field
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isOtpSent, setIsOtpSent] = useState(false); // To track OTP sent status
  const [otpError, setOtpError] = useState(""); // To handle OTP validation error
  const [generatedOtp, setGeneratedOtp] = useState<string>(""); // Store the generated OTP
  const [isSignUpSubmitted, setIsSignUpSubmitted] = useState(false); // To handle sign-up submission
  const router = useRouter(); // For redirection

  // Handle profile image upload
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setProfileImage(event.target.files[0]);
    }
  };

  // Handle form input changes
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { id, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  // Validate the form
  const validateForm = () => {
    const newErrors: string[] = [];

    // Full Name validation
    if (!formData.fullName.trim()) {
      newErrors.push("Full Name is required.");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.push("Please enter a valid email address.");
    }

    // Mobile number validation (minimum 10 digits, numeric only)
    const mobileRegex = /^[0-9]{10,}$/;
    if (!mobileRegex.test(formData.mobile)) {
      newErrors.push("Mobile number must be at least 10 digits");
    }

    // Password validation (minimum 8 characters)
    if (formData.password.length < 8) {
      newErrors.push("Password must be at least 8 characters long.");
    }

    // Confirm Password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.push("Passwords do not match.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  // Simulate OTP sending (dynamically generate OTP)
  const sendOtp = () => {
    if (formData.mobile.length === 10) {
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
      setGeneratedOtp(generatedOtp);
      console.log("OTP sent to:", formData.mobile, "OTP:", generatedOtp);
      setIsOtpSent(true);
    } else {
      setErrors(["Please enter a valid mobile number before sending OTP"]);
    }
  };

  // Verify OTP
  // const verifyOtp = () => {
  //   if (formData.otp === generatedOtp) { // Check OTP
  //     console.log("OTP verified successfully");
  //     router.push("/"); // Redirect to success page
  //   } else {
  //     setOtpError("Invalid OTP. Please try again.");
  //   }
  // };

  // Handle form submission (Sign Up)
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validateForm()) {
      // Only send OTP after validating the form
      sendOtp();
      setIsSignUpSubmitted(true); // Mark sign-up as submitted
    }
  };

  // const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  //   event.preventDefault();
  
  //   if (validateForm()) {
  //     // Generate OTP and send to the user
  //     sendOtp();
  //     setIsSignUpSubmitted(true); // Move to OTP verification step
  //   }
  // };
  
  const verifyOtp = async () => {
    if (formData.otp === generatedOtp) {
      console.log("OTP verified successfully");
  
      // Prepare payload with the form data
      const formPayload = {
        ...formData,
        profileImage: profileImage ? URL.createObjectURL(profileImage) : "", // Temporary file URL for image preview
      };
  
      try {
        // Submit form data to the server
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formPayload),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          console.log("Registration successful", data);
          router.push("/category"); // Redirect to success page
        } else {
          console.error("Error during registration:", data.message);
          setErrors([data.message]);
        }
      } catch (error) {
        console.error("Unexpected error:", error);
        setErrors(["An unexpected error occurred."]);
      }
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };
  

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign Up</h1>
        {!isSignUpSubmitted ? (
          // Sign-up form
          <form onSubmit={handleSubmit}>
            {/* Profile Image Upload */}
            
            <div className={styles.profileImageWrapper}>
              <label htmlFor="profileImage" className={styles.profileImageLabel}>
                {profileImage ? (
                  <img
                    src={URL.createObjectURL(profileImage)}
                    alt="Profile"
                    className={styles.profileImage}
                  />
                ) : (
                  <span className={styles.placeholderText}>Add Photo</span>
                )}
              </label>
              <input
                type="file"
                id="profileImage"
                className={styles.profileInput}
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

           <div className={styles.flexColumn}>
             {/* Full Name */}
             <div className={styles.inputGroup}>
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>

            {/* Email */}
            <div className={styles.inputGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Your@email.com"
                required
              />
            </div>
           </div>

            {/* Mobile */}
            <div className={styles.inputGroup}>
              <label htmlFor="mobile">Mobile</label>
              <input
                type="text"
                id="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="10-digit mobile number"
                required
              />
            </div>

            {/* Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm Password"
                required
              />
            </div>

            {/* Validation Errors */}
            {errors.length > 0 && (
              <div className={styles.errorWrapper}>
                {errors.map((error, index) => (
                  <p key={index} className={styles.errorText}>
                    {error}
                  </p>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className={styles.submitButton}> Sign Up</button>

            {/* Already have an account */}
            <p className={styles.footerText}>
              Already have an account?{" "}
              <a href="/login" className={styles.link}>
                Log in here
              </a>
            </p>
          </form>
        ) : (
          // OTP verification form
          <div>
            <div className={styles.inputGroup}>
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter OTP sent to your mobile"
                required
              />
              {otpError && <p className={styles.errorText}>{otpError}</p>}
              <div className={styles.verificationOtp}>
              <button type="button" className={styles.otpButton} onClick={verifyOtp}>Verify OTP</button>
              <button type="button" className={styles.backButton} onClick={() => setIsSignUpSubmitted(false)}>Back to Sign Up</button>
              </div>
            </div>

            
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationForm;
