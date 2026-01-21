import React from 'react';
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

        {/* Third Column */}
        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/ProductForm">Post Your Product</a></li>
            <li><a href="/terms-and-conditions">Terms and Conditions</a></li>
            <li><a href="/privacy-policy">Privacy Policy</a></li>
            <li><a href="/shipping-policy">Shipping Policy</a></li>
            <li><a href="/contact-us">Contact Us</a></li>

            {/* ⭐ New Install App Link */}
            <li>
              <a href="/install" className={styles.installLink}>
                Install App
              </a>
            </li>
          </ul>
        </div>

        {/* Fourth Column */}
        <div className={styles.footerSection}>
          <h4>Address</h4>
          <ul>
            <li>
              <a
                href="https://www.google.com/maps?q=8-A,+Lakhnaur+Pind+Rd,+Industrial+Area,+Sector+75,+Sahibzada+Ajit+Singh+Nagar,+Punjab+140307"
                target="_blank"
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
