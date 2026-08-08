"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/ProfileDashboard/Layout/DashboardLayout";
import { withProtectedPage } from "@/components/withProtectedPage";
import styles from "./Index.module.scss";
import VerificationModal from "@/components/ProfileDashboard/Verification/VerificationModal/Index";
import VerificationStatusCard from "@/components/ProfileDashboard/Verification/VerificationStatusCard/Index";
import { useSession } from "next-auth/react";

const Verification = () => {
  const { data: session, status } = useSession();
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  // ✅ Fetch verification status
  useEffect(() => {
    const fetchVerification = async () => {
      if (!session?.user?.id) return;
      const res = await fetch(`/api/verification/checkStatus?userId=${session.user.id}`);
      const data = await res.json();
      setVerificationStatus(data);
    };
    fetchVerification();
  }, [session?.user?.id]);

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Verification Center</h2>

        <div className={styles.verificationDashboard}>
          {/* ✅ Status Card */}
          {verificationStatus && <VerificationStatusCard status={verificationStatus} />}

          {/* ✅ Conditional rendering */}
          {verificationStatus?.status === "Pending" || verificationStatus?.status === "Approved" ? (
            <div className={styles.verifiedBox}>
              <h3 className={styles.verifiedTitle}>
                {verificationStatus?.status === "Pending"
                  ? "Your verification is under review"
                  : "Verification Approved ✅"}
              </h3>
              <p className={styles.verifiedText}>
                {verificationStatus?.status === "Pending"
                  ? "Our team is reviewing your documents. You’ll be notified once approved."
                  : "You can now upload your products for rent and start earning securely on OnShoper."}
              </p>
            </div>
          ) : (
            <div className={styles.card}>
              <p className={styles.infoText}>Complete your verification steps below:</p>
              <div className={styles.actions}>
                <button
                  onClick={() => setShowVerificationModal(true)}
                  className={styles.btnPrimary}
                >
                  Start Verification
                </button>
              </div>
            </div>
          )}

          {/* ✅ Consolidated Verification Modal */}
          {showVerificationModal && (
            <VerificationModal onClose={() => setShowVerificationModal(false)} />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default withProtectedPage(Verification);
