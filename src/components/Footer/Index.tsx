import React from 'react';
import Link from 'next/link';
import styles from '@/components/Footer/Index.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>

        {/* First Column */}
        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <ul>
            <li>
              <a href="mailto:onshoper390@gmail.com" className="icon-mail">
                onshoper390@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+917652800205" className="icon-phone">
                +91 7652800205
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link href="/ProductForm">Post Your Product</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions">Terms and Conditions</Link>
            </li>
            <li>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/shipping-policy">Shipping Policy</Link>
            </li>
            <li>
              <Link href="/contact-us">Contact Us</Link>
            </li>

            {/* ⭐ Install App */}
            <li>
              <Link href="/install" className={styles.installLink}>
                Install App
              </Link>
            </li>
            <li>
              <Link href="/blog">Blogs</Link>
            </li>
          </ul>
        </div>

        {/* Address */}
        <div className={styles.footerSection}>
          <h4>Address</h4>
          <ul>
            <li>
              <a
                href="https://www.google.com/maps?q=8-A,+Lakhnaur+Pind+Rd,+Industrial+Area,+Sector+75,+Sahibzada+Ajit+Singh+Nagar,+Punjab+140307"
                target="_blank"
                rel="noopener noreferrer"
                className="icon-location"
              >
                D-258, GR Tower Industrial Area, Sector 75 S.A.S. Nagar (Mohali) Punjab – 160071 India
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Onshoper. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
