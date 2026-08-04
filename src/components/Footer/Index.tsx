import React from "react";
import Link from "next/link";
import styles from "@/components/Footer/Index.module.scss";

const Footer = () => {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerContent}>
        
        {/* Contact */}
        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <ul>
            <li>
              <a href="mailto:onshoper390@gmail.com" className="icon-mail" aria-label="Email OnShoper" title="Email OnShoper">
                onshoper390@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:+917652800205" className="icon-phone" aria-label="Call OnShoper" title="Call OnShoper">
                +91 7652800205
              </a>
            </li>
          </ul>
        </div>

        {/* Quick Links */}
        <nav className={styles.footerSection} aria-label="Footer navigation">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <Link href="/ProductForm" aria-label="Post Your Product" title="Post Your Product">
                Post Your Product
              </Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" aria-label="Terms and Conditions" title="Terms and Conditions">
                Terms and Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" aria-label="Privacy Policy" title="Privacy Policy">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/shipping-policy" aria-label="Shipping Policy" title="Shipping Policy">
                Shipping Policy
              </Link>
            </li>
            <li>
              <Link href="/contact-us" aria-label="Contact Us" title="Contact Us">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/install" className={styles.installLink} aria-label="Install OnShoper App" title="Install OnShoper App">
                Install App
              </Link>
            </li>
            <li>
              <Link href="/blog" aria-label="Read OnShoper Blogs" title="Read OnShoper Blogs">
                Blogs
              </Link>
            </li>
          </ul>
        </nav>

        {/* Address */}
        <address className={styles.footerSection}>
          <h4>Address</h4>
          <ul>
            <li>
              <a href="https://www.google.com/maps?q=8-A,+Lakhnaur+Pind+Rd,+Industrial+Area,+Sector+75,+Sahibzada+Ajit+Singh+Nagar,+Punjab+140307"
                target="_blank" rel="noopener noreferrer" className="icon-location"
                aria-label="Open OnShoper office location in Google Maps"
                title="View on Google Maps">Industrial Area, Sector 75 S.A.S. Nagar (Mohali), Punjab – 160071, India
              </a>
            </li>
          </ul>
        </address>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} OnShoper. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
