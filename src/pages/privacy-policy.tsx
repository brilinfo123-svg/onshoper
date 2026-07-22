import React from "react";
import styles from "../styles/PrivacyPolicy.module.scss";
import SEO from "next/head"; 

export default function PrivacyPolicy() {
  return (
    <>
      <SEO>
        <title>Privacy Policy – OnShoper Marketplace</title>
        <meta
          name="description"
          content="Read OnShoper's Privacy Policy to understand how we collect, use, and protect your personal information when you buy, sell, or rent products and services."
        />
        <link rel="canonical" href="https://onshoper.com/privacy-policy" />
        <meta name="robots" content="index, follow" />
      </SEO>
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Privacy Policy</h1>
        <p className={styles.updated}>Last updated: November 12, 2025</p>

        <section>
          <p>
            Welcome to <strong>Sale and Rent</strong>. Your privacy is important
            to us. This Privacy Policy explains how we collect, use, and protect
            your personal information when you use our website and services.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <ul>
            <li>Personal details such as name, email, phone number, and address.</li>
            <li>Property details you list for sale or rent.</li>
            <li>Payment information when you make transactions.</li>
            <li>Usage data such as IP address, browser type, and device info.</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <ul>
            <li> We implement industry-standard security measures to protect your data.</li>
            <li>However, no method of transmission over the internet is 100% secure.</li>
            <li>To communicate with you about listings, offers, and updates.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our services.</li>
            <li>To process transactions securely.</li>
            <li>To communicate with you about listings, offers, and updates.</li>
            <li>To comply with legal obligations.</li>
          </ul>
        </section>

        <section>
                <h2>Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <ul>
                    <li>📞 Phone: <strong>+91 7652800205</strong></li>
                    <li className="icon-mail-alt">Email: <strong>brilinfo123@gmail.com</strong></li>
                </ul>
        </section>

      </div>
    </div>
    </>
  );
}
