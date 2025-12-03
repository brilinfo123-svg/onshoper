import React, { useState } from "react";
import styles from "../styles/contactUs.module.scss";
import Swal from "sweetalert2";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false); // loader state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // show loader

    try {
      const res = await fetch("/api/reports/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "We’ll get back to you as soon as possible.",
          confirmButtonColor: "#00acc1",
        });
        setFormData({ name: "", email: "", message: "" }); // reset form
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Something went wrong. Please try again later.",
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Network issue. Please try again.",
      });
    } finally {
      setLoading(false); // hide loader
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Contact Us</h1>
        <p className={styles.updated}>
          Your queries are important to us reach out with confidence
        </p>

        <div className={styles.grid}>
          {/* Left Column - Direct Contact */}
          <div className={styles.contactInfo}>
            <h2>Direct Contact</h2>
            <p>
              You can reach us directly via phone, email, or visit our office at the address below.
            </p>
            <ul className={styles.contactList}>
                <li>
                <span className="icon-user"></span>
                <strong>Aakash Verma</strong>
              </li>
              <li>
                <span className="icon-phone"></span>
                <strong>+91 7652800205</strong>
              </li>
              <li>
                <span className="icon-mail-alt"></span>
                <strong>onshoper390@gmail.com</strong>
              </li>
              <li>
                <span className="icon-location"></span>
                <strong>
                  D-258, GR Tower Industrial Area, Sector 75 S.A.S. Nagar (Mohali) Punjab – 160071 India
                </strong>
              </li>
            </ul>
          </div>

          {/* Right Column - Form */}
          <div className={styles.formWrapper}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div>
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Message:</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <span className={styles.loader}></span>
                    <span className={styles.sendingText}>Sending...</span>
                  </>
                ) : (
                  "Send Message"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
