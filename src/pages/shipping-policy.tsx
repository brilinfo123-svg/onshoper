import React from "react";
import styles from "../styles/PrivacyPolicy.module.scss"; // reuse same styles

export default function UploadPolicy() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Subscription Policy</h1>
        <p className={styles.updated}>Last updated: November 12, 2025</p>

        <section>
          <p>
            Welcome to <strong>Sale and Rent</strong>. This policy explains how
            users can upload products on our platform and the subscription rules
            that apply. Please read carefully to understand your rights and
            responsibilities.
          </p>
        </section>

        <section>
          <h2>Free Upload Benefit</h2>
          <ul>
            <li>
              Every new user can upload their <strong>first product free of
              charge</strong>.
            </li>
            <li>
              This free upload remains active for <strong>two months</strong>
              from the date of posting.
            </li>
            <li>
              After the free period ends, users must subscribe to continue
              uploading products.
            </li>
          </ul>
        </section>

        <section>
          <h2>Subscription & Payment</h2>
          <ul>
            <li>
              To upload more than one product, users must pay a fixed
              subscription amount.
            </li>
            <li>
              After successful payment, users are redirected to the product
              upload form.
            </li>
            <li>
              The subscription allows <strong>unlimited product uploads</strong>
              for a period of two months.
            </li>
          </ul>
        </section>

        <section>
          <h2>Renewal Policy</h2>
          <ul>
            <li>
              After two months, the subscription expires automatically.
            </li>
            <li>
              To continue uploading products, users must renew their
              subscription by paying the same amount again.
            </li>
            <li>
              Renewal ensures uninterrupted access to the product upload form
              and unlimited uploads.
            </li>
          </ul>
        </section>

        <section>
          <h2>Refunds & Cancellations</h2>
          <ul>
            <li>
              Subscription fees once paid are non-refundable, except in cases of
              technical errors during payment.
            </li>
            <li>
              Users may cancel their subscription at any time, but no refunds
              will be issued for unused time.
            </li>
          </ul>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have any questions about this policy, please contact us at:
          </p>
          <ul>
            <li>📞 Phone: <strong>+91 7652800205</strong></li>
            <li className="icon-mail-alt">
              Email: <strong>brilinfo123@gmail.com</strong>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
