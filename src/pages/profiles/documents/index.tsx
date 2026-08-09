"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/ProfileDashboard/Layout/DashboardLayout";
import styles from "./Index.module.scss";
import { withProtectedPage } from "@/components/withProtectedPage";
import { useSession } from "next-auth/react";
import { FiFileText, FiUserCheck } from "react-icons/fi";

function Documents() {
  const { data: session } = useSession();
  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/verification/getCurrentUser?userId=${session.user.id}`);
        const data = await res.json();
        setDoc(data);
      } catch (error) {
        console.error("Failed to fetch document details:", error);
      }
    };
    fetchDoc();
  }, [session?.user?.id]);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Documents</h2>

        {!doc ? (
          <div className={styles.card}>
            <p>No documents uploaded.</p>
          </div>
        ) : (
          <div className={styles.card}>
            <ul className={styles.docList}>
              <li className={styles.docItem}>
                <FiFileText className={styles.icon} />
                <span className={styles.docName}>{doc.idType || "Unknown ID"}</span>
                <span
                  className={`${styles.badge} ${
                    doc.status === "Approved" ? styles.verified : styles.pending
                  }`}
                >
                  {doc.status}
                </span>
              </li>
              <li className={styles.docItem}>
                <FiUserCheck className={styles.icon} />
                <span className={styles.docName}>Name</span>
                <span className={styles.value}>{doc.name || "N/A"}</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default withProtectedPage(Documents);
