"use client";
import React, { useEffect, useState } from "react";
import styles from "@/styles/profile/profile.module.scss";
import { useSession } from "next-auth/react";

const DocumentStatus = () => {
  const { data: session } = useSession();
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    const fetchDocStatus = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/verification/getCurrentUser?userId=${session.user.id}`);
        const data = await res.json();
        setDoc(data);
      } catch (error) {
        console.error("Failed to fetch document status:", error);
      }
    };
    fetchDocStatus();
  }, [session?.user?.id]);

  return (
    <div className={styles.documentCard}>
      <h3 className={styles.title}>Document Status</h3>

      {!doc ? (
        <p>Loading...</p>
      ) : (
        <ul className={styles.docList}>
          <li className={styles.docItem}>
            <span>{doc.idType || "Unknown ID"}</span>
            <span
              className={`${styles.badge} ${
                doc.status === "Approved" ? styles.verified : styles.pending
              }`}
            >
              {doc.status}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
};

export default DocumentStatus;
