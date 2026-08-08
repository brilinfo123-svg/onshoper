import React from "react";
import Image from "next/image";
import { FiStar, FiCheck, FiX } from "react-icons/fi";
import styles from "@/styles/profile/table.module.scss";
import Link from "next/link";

const RentalRequestsTable = () => {
  const rows = [
    {
      product: {
        name: "iPhone 15 Pro Max",
        specs: "256GB, Blue Titanium",
        image: "/images/img7.jpg",
      },
      user: { name: "Rahul Kumar", rating: 4.8, avatar: "/images/profile.png" },
      duration: { days: "3 Days", range: "10 - 13 Aug" },
      deposit: "₹5,000",
      status: "Pending",
    },
    {
      product: {
        name: "MacBook Air M2",
        specs: "13 inch, 512GB",
        image: "/images/img6.jpg",
      },
      user: { name: "Priya Sharma", rating: 4.9, avatar: "/images/profile.png" },
      duration: { days: "5 Days", range: "11 - 16 Aug" },
      deposit: "₹8,000",
      status: "Pending",
    },
    {
      product: {
        name: "Canon EOS R50",
        specs: "Camera",
        image: "/images/img5.jpg",
      },
      user: { name: "Aman Verma", rating: 4.7, avatar: "/images/profile.png" },
      duration: { days: "2 Days", range: "09 - 11 Aug" },
      deposit: "₹3,000",
      status: "Pending",
    },
    {
      product: {
        name: "Activa 6G",
        specs: "Scooter",
        image: "/images/img5.jpg",
      },
      user: { name: "Vikas Singh", rating: 4.6, avatar: "/images/profile.png" },
      duration: { days: "7 Days", range: "12 - 19 Aug" },
      deposit: "₹2,500",
      status: "Pending",
    },
  ];

  return (
    <div className={styles.tableCard}>
      <div className={styles.headerRow}>
        <h3 className={styles.tableTitle}>Recent Rental Requests</h3>
        <Link className={styles.viewAll} href="/profiles/rental-requests"  aria-label="Alls Requests" title="View Alls Requests">View All</Link>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Product</th>
            <th>Requested By</th>
            <th>Duration</th>
            <th>Deposit</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              <td>
                <div className={styles.productCell}>
                  <Image
                    src={row.product.image}
                    alt={row.product.name}
                    width={40}
                    height={40}
                    className={styles.productImg}
                  />
                  <div>
                    <p className={styles.productName}>{row.product.name}</p>
                    <span className={styles.productSpecs}>{row.product.specs}</span>
                  </div>
                </div>
              </td>

              <td>
                <div className={styles.userCell}>
                  <Image
                    src={row.user.avatar}
                    alt={row.user.name}
                    width={40}
                    height={40}
                    className={styles.avatar}
                  />
                  <div>
                    <p className={styles.userName}>{row.user.name}</p>
                    <span className={styles.rating}>
                      <FiStar className={styles.starIcon} /> {row.user.rating}
                    </span>
                  </div>
                </div>
              </td>

              <td>
                <p className={styles.durationDays}>{row.duration.days}</p>
                <span className={styles.durationRange}>{row.duration.range}</span>
              </td>

              <td>{row.deposit}</td>

              <td>
                <span className={`${styles.badge} ${styles[row.status.toLowerCase()]}`}>
                  {row.status}
                </span>
              </td>

              <td>
                <div className={styles.actionBtns}>
                  <button className={`${styles.actionBtn} ${styles.approve}`}>
                    <FiCheck />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.reject}`}>
                    <FiX />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RentalRequestsTable;
