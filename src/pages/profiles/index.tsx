"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/ProfileDashboard/Layout/DashboardLayout";
import WelcomeCard from "@/components/ProfileDashboard/Dashboard/WelcomeCard";
import StatsCards from "@/components/ProfileDashboard/Dashboard/StatsCards";
import RentalRequestsTable from "@/components/ProfileDashboard/Dashboard/RentalRequestsTable";
import ProfileUpdateModal from "@/components/ProfileDashboard/Dashboard/ProfileUpdateModal/Index";
import Notifications from "@/components/ProfileDashboard/Dashboard/Notifications";
import DocumentStatus from "@/components/ProfileDashboard/Dashboard/DocumentStatus";
import { withProtectedPage } from "@/components/withProtectedPage";

import { useProfile } from "@/contexts/ProfileContext";
import { useSession } from "next-auth/react";

// ✅ New imports
import VerificationModal from "@/components/ProfileDashboard/Verification/VerificationModal/Index"; 
import VerificationStatusCard from "@/components/ProfileDashboard/Verification/VerificationStatusCard/Index";
import styles from "@/styles/profile/verification.module.scss";

const ProfileDashboard = () => {
  const { data: session, status } = useSession();
  const { profile: shopData, loading, fetchProfile } = useProfile();

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<any>(null);

  // Fetch profile + verification status
  useEffect(() => {
    if (status !== "authenticated") return;
    if (!session?.user?.contact) return;
    fetchProfile(session.user.contact);

    const fetchVerification = async () => {
      const res = await fetch(`/api/verification/checkStatus?userId=${session.user.id}`);
      const data = await res.json();
      setVerificationStatus(data);
    };
    fetchVerification();
  }, [status, session?.user?.contact, fetchProfile, session?.user?.id]);

  return (
    <DashboardLayout>
      {/* Welcome Card */}
      <WelcomeCard
        onEditProfile={() => setShowProfileModal(true)}
        user={shopData?.user}
        loading={loading}
      />

      {/* Profile Update Modal */}
      {showProfileModal && (
        <ProfileUpdateModal
          onClose={() => setShowProfileModal(false)}
          onUpdated={() => fetchProfile(session.user.contact)}
        />
      )}

      {/* Dashboard Sections */}
      <StatsCards />
      <RentalRequestsTable />

      {/* ✅ Verification Section */}
{/* ✅ Verification Section */}
<div className={styles.verificationSection}>
  <h2 className={styles.sectionTitle}>Verification Center</h2>

  {/* ✅ Status Card */}
  {verificationStatus && <VerificationStatusCard status={verificationStatus} />}

  {/* ✅ Conditional rendering */}
  {verificationStatus?.status === "Pending" ? (
    <div className={styles.pendingBox}>
        {/* <div className={styles.pendingHeader}>
          <span className={styles.pendingIcon}>🕒</span>
          <h3 className={styles.pendingTitle}>Verification In Progress</h3>
        </div> */}
        <p className={styles.pendingText}>
          ✅ Your documents have been submitted successfully.
        </p>
        <p className={styles.pendingSubText}>
          Our team is reviewing your details. You’ll be notified once your verification is approved.
        </p>
    </div>
  ) : verificationStatus?.status === "Approved" ? (
    // ✅ Hide messages completely when approved
    null
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



      <Notifications />
      <DocumentStatus />
    </DashboardLayout>
  );
};

export default withProtectedPage(ProfileDashboard);
