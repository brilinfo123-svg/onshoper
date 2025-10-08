import React from 'react';
import styles from '@/components/Footer/Index.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h4>Contact Us</h4>
          <ul>
            <li><a href="mailto:brilinfo123@gmail.com" className='icon-mail'> brilinfo123@gmail.com</a></li>
            <li><a href="tel:+1234567890" className='icon-phone'>+1234567890</a></li>
          </ul>
        </div>

        {/* <div className={styles.footerSection}>
          <h4>Follow Us</h4>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialIcon}>FB</a>
            <a href="#" className={styles.socialIcon}>IG</a>
            <a href="#" className={styles.socialIcon}>TW</a>
          </div>
        </div> */}

        <div className={styles.footerSection}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/ProductForm">Post Your Product</a></li>
            <li><a href="/profile">My Account</a></li>
          </ul>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>&copy; {new Date().getFullYear()} Brilinfo. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
