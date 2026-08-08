"use client";
import React from "react";
import styles from "./Index.module.scss";
import Image from "next/image";

interface VerificationStatusCardProps {
  status: {
    status: string; // "Pending" | "Approved" | "Rejected"
    updatedAt?: string;
  };
}

export default function VerificationStatusCard({ status }: VerificationStatusCardProps) {
  const getBadgeClass = () => {
    switch (status.status) {
      case "Approved":
        return styles.approved;
      case "Rejected":
        return styles.rejected;
      default:
        return styles.pending;
    }
  };

  return (
    <div className={styles.card}>
      <Image src="/images/driving-license.png" alt="Verification Icon" width={100} height={100} />
      <h3 className={styles.title}>Verification Status</h3>
      <span className={`${styles.badge} ${getBadgeClass()}`}>
        {status.status?.toUpperCase()}
      </span>

      {/* {status.updatedAt && (
        <p className={styles.info}>
          Last updated: {new Date(status.updatedAt).toLocaleString()}
        </p>
      )} */}
    </div>
  );
}
