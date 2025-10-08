import React from 'react'
import styles from '@/components/Benefits/Index.module.scss'


interface Benefit {
  title: string;
  description: string;
  icon: string;
}

const benefits: Benefit[] = [
  {
    title: 'Quick Listings',
    description: 'Post your property or product in seconds.',
    icon: '/images/easy.png',
  },
  {
    title: 'Smart Dashboard',
    description: 'Track views, leads & performance easily.',
    icon: '/images/customerService.png',
  },
  {
    title: 'Verified & Secure',
    description: 'Trusted listings with secure transactions.',
    icon: '/images/shield.png',
  },
  {
    title: 'Best Deals',
    description: 'Enjoy exclusive offers & zero brokerage.',
    icon: '/images/moneySaving.png',
  },
];


const Benefits: React.FC = () => {
  return (
    <section className={styles.benefitsSection}>
       <div className="container">
       <h2 className={styles.sectionTitle}>Benefits of Using Our Platform</h2>
      <div className={styles.benefitsGrid}>
        {benefits.map((benefit, index) => (
          <div key={index} className={styles.benefitCard}>
            <div className={styles.iconWrapper}>
              <img src={benefit.icon} alt={benefit.title} className={styles.icon} />
            </div>
            <h3 className={styles.benefitTitle}>{benefit.title}</h3>
            <p className={styles.benefitDescription}>{benefit.description}</p>
          </div>
        ))}
      </div>
       </div>
    </section>
  );
};

export default Benefits;

