import React from "react";
import styles from "../styles/PrivacyPolicy.module.scss";
import SEO from "next/head";

export default function PrivacyPolicy() {
  return (
    <>
    <SEO>
        <title>Terms & Conditions – OnShoper Marketplace</title>
        <meta
          name="description"
          content="Read OnShoper's Terms & Conditions to understand user responsibilities, listing rules, transactions, intellectual property rights, and account termination policies."
        />
        <link rel="canonical" href="https://onshoper.com/terms-and-conditions" />
        <meta name="robots" content="index, follow" />
      </SEO>
    
    <div className={styles.wrapper}>
      <div className={styles.card}>
      <h1 className={styles.title}>Terms & Conditions</h1>
      <p className={styles.updated}>Last updated: November 12, 2025</p>

      <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>Sale and Rent</strong>, you agree to
            comply with these Terms of Service. If you do not agree, you must
            discontinue use of our platform.
          </p>
        </section>

        <section>
          <h2>2. User Responsibilities</h2>
          <ul>
            <li>You must provide accurate property and personal information.</li>
            <li>You are responsible for maintaining the confidentiality of your account.</li>
            <li>You agree not to misuse or attempt to hack the platform.</li>
          </ul>
        </section>

        <section>
          <h2>3. Listings and Transactions</h2>
          <ul>
            <li>All property listings must be legal and comply with local regulations.</li>
            <li>Payments processed via Razorpay or other gateways must be valid.</li>
            <li>We are not responsible for disputes between buyers and sellers.</li>
          </ul>
        </section>

        <section>
          <h2>4. Intellectual Property</h2>
          <p>
            All content, branding, and design on <strong>Sale and Rent</strong>
            are owned by Brilinfo. You may not copy, reproduce, or distribute
            without permission.
          </p>
        </section>

        <section>
          <h2>5. Termination</h2>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these Terms of Service or engage in fraudulent activity.
          </p>
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
