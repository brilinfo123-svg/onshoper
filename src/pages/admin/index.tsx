"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import styles from "./Admin.module.scss";

interface Verification {
  _id: string;
  userId: string;
  email: string;
  idType: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  selfieVerified: boolean;
  status: string;
  createdAt: string;
}

interface Report {
  _id: string;
  productId: string;
  reason: string;
  comment: string;
}

const rejectReasons = [
  "Documents do not match",
  "Selfie and documents do not match",
  "Selfie is not clear",
  "Document is not clear",
  "Document information is not readable",
  "Invalid or incorrect document",
  "Document appears to be edited",
  "Other",
];

export default function AdminDashboard() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"verification" | "reports">(
    "verification"
  );

  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  const [loading, setLoading] = useState(false);

  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);

  const [rejecting, setRejecting] = useState<Verification | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [processingVerification, setProcessingVerification] = useState<"approve" | "reject" | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  // =========================
  // FETCH VERIFICATIONS
  // =========================

  const fetchVerifications = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "/api/verification/pendingVerification"
      );

      if (!res.ok) {
        throw new Error("Failed to fetch verification requests");
      }

      const data = await res.json();

      setVerifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load verification requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // FETCH REPORTS
  // =========================

  const fetchReports = async () => {
    try {
      setLoadingReports(true);
  
      const res = await fetch("/api/reports");
  
      if (!res.ok) {
        throw new Error("Failed to fetch reports");
      }
  
      const data = await res.json();
  
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch reports error:", error);
  
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load product reports.",
      });
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    if (activeTab === "verification") {
      fetchVerifications();
    }

    if (activeTab === "reports") {
      fetchReports();
    }
  }, [activeTab]);

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    await fetch("/api/admin/logout", {
      method: "POST",
    });

    router.push("/admin/login");
  };

  // =========================
  // APPROVE
  // =========================

  const handleApprove = async (verification: Verification) => {
    // Close document modal FIRST
    setSelectedVerification(null);
  
    const result = await Swal.fire({
      title: "Approve Verification?",
      text: "This user's verification will be approved.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#16a34a",
      allowOutsideClick: false,
      allowEscapeKey: true,
    });
  
    if (!result.isConfirmed) {
      return;
    }
  
    try {
      setProcessingVerification("approve");
  
      // Show loading immediately
      Swal.fire({
        title: "Approving Verification...",
        text: "Please wait while we process the verification.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const res = await fetch(
        `/api/verification/${verification._id}/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(
          data.error || "Approval failed"
        );
      }
  
      // Remove from pending list
      setVerifications((prev) =>
        prev.filter(
          (item) => item._id !== verification._id
        )
      );
  
      setProcessingVerification(null);
  
      // Success message
      await Swal.fire({
        icon: "success",
        title: "Verification Approved",
        text: "The user has been successfully verified.",
        confirmButtonColor: "#16a34a",
      });
  
    } catch (error) {
      console.error("Approval error:", error);
  
      setProcessingVerification(null);
  
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to approve this verification.",
      });
    }
  };

  // =========================
  // OPEN REJECT MODAL
  // =========================

  const openRejectModal = (verification: Verification) => {
    setRejecting(verification);
    setRejectReason("");
    setCustomReason("");
  };

  // =========================
  // REJECT
  // =========================

  const handleReject = async () => {
    if (!rejecting) return;
  
    const reason =
      rejectReason === "Other"
        ? customReason.trim()
        : rejectReason.trim();
  
    if (!reason) {
      Swal.fire({
        icon: "warning",
        title: "Reason Required",
        text: "Please select or enter a rejection reason.",
      });
  
      return;
    }
  
    // Keep a copy because we are going to close the modal
    const verificationToReject = rejecting;
  
    // ✅ CLOSE BOTH MODALS IMMEDIATELY
    setRejecting(null);
    setSelectedVerification(null);
  
    // Ask confirmation AFTER closing the document/reason modal
    const result = await Swal.fire({
      title: "Reject Verification?",
      html: `
        <p>This verification will be rejected.</p>
        <p>
          <strong>Reason:</strong> ${reason}
        </p>
        <p style="color:#6b7280;font-size:14px;">
          The user will receive an email with this reason.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc2626",
      allowOutsideClick: false,
    });
  
    // If admin clicks Cancel, nothing happens
    if (!result.isConfirmed) {
      return;
    }
  
    try {
      setProcessingVerification("reject");
  
      // ✅ SHOW LOADING
      Swal.fire({
        title: "Rejecting Verification...",
        text: "Deleting documents and sending notification email.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
  
      const res = await fetch(
        `/api/verification/${verificationToReject._id}/reject`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason,
          }),
        }
      );
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(
          data.error || "Rejection failed"
        );
      }
  
      // ✅ REMOVE FROM TABLE
      setVerifications((prev) =>
        prev.filter(
          (item) => item._id !== verificationToReject._id
        )
      );
  
      // Clear states
      setRejectReason("");
      setCustomReason("");
      setProcessingVerification(null);
  
      // ✅ SUCCESS
      await Swal.fire({
        icon: "success",
        title: "Verification Rejected",
        html: `
          <p>
            Verification has been rejected successfully.
          </p>
  
          ${
            data.email
              ? `
                <p style="margin-top:10px;">
                  Email sent to:
                </p>
  
                <strong>${data.email}</strong>
              `
              : ""
          }
        `,
        confirmButtonColor: "#dc2626",
      });
  
    } catch (error) {
      console.error(
        "Reject verification error:",
        error
      );
  
      setProcessingVerification(null);
  
      Swal.fire({
        icon: "error",
        title: "Rejection Failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to reject this verification.",
      });
    }
  };

  // =========================
  // VIEW PRODUCT
  // =========================

  const handleViewProduct = (id: string) => {
    router.push(`/product/${id}`);
  };

  // =========================
  // DELETE REPORT
  // =========================

  const handleDeleteReport = async (id: string, productId: string) => {
    const result = await Swal.fire({
      title: "Delete Product?",
      text: "This will also remove its reports.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#dc2626",
    });

    if (!result.isConfirmed) return;

    const res = await fetch(`/api/reports/${productId}/delete`, {
      method: "DELETE",
    });

    if (res.ok) {
      setReports((prev) => prev.filter((item) => item._id !== id));

      Swal.fire("Deleted", "Product reports deleted.", "success");
    }
  };

  return (
    <main className={styles.container}>
      {/* HEADER */}

      <header className={styles.header}>
        <div>
          <h1>Admin Dashboard</h1>
          <p>
            Manage verification requests, reports and marketplace activity.
          </p>
        </div>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* TABS */}

      <nav className={styles.tabs}>
        <button
          className={`${styles.tabBtn} ${
            activeTab === "verification" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("verification")}
        >
          🛡️ Verification Requests
        </button>

        <button
          className={`${styles.tabBtn} ${
            activeTab === "reports" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("reports")}
        >
          🚩 Product Reports
        </button>
      </nav>

      {/* =========================
          VERIFICATION TABLE
      ========================= */}

{activeTab === "verification" && (
  <section className={styles.card}>
    <div className={styles.cardHeader}>
      <div>
        <h2>Verification Requests</h2>
        <p>
          Review identity documents before approving verification.
        </p>
      </div>

      <span className={styles.count}>
        {verifications.length} Pending
      </span>
    </div>

    {/* 👇 ADD/REPLACE LOADING HERE */}
    {loading ? (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading verification requests...</span>
      </div>
    ) : verifications.length === 0 ? (
      <div className={styles.empty}>
        <span>✓</span>
        <p>No pending verification requests.</p>
      </div>
    ) : (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Email</th>
              <th>ID Type</th>
              <th>Selfie</th>
              <th>Status</th>
              <th>View</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {verifications.map((item) => (
              <tr key={item._id}>
                <td>
                  <span className={styles.email}>
                    {item.email || "No email"}
                  </span>
                </td>

                <td>{item.idType}</td>

                <td>
                  <span className={styles.verified}>
                    ✓ Verified
                  </span>
                </td>

                <td>
                  <span className={styles.pending}>
                    {item.status}
                  </span>
                </td>

                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      setSelectedVerification(item)
                    }
                  >
                    👁 View
                  </button>
                </td>

                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleApprove(item)}
                    >
                      ✓ Approve
                    </button>

                    <button
                      className={styles.rejectBtn}
                      onClick={() =>
                        openRejectModal(item)
                      }
                    >
                      × Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

      {/* =========================
          REPORTS
      ========================= */}

{activeTab === "reports" && (
  <section className={styles.card}>
    <div className={styles.cardHeader}>
      <div>
        <h2>Product Reports</h2>
        <p>Review reports submitted by users.</p>
      </div>

      <span className={styles.count}>
        {loadingReports ? "Loading..." : `${reports.length} Reports`}
      </span>
    </div>

    {loadingReports ? (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <span>Loading product reports...</span>
      </div>
    ) : reports.length === 0 ? (
      <div className={styles.empty}>
        <span>✓</span>
        <p>No reports available.</p>
      </div>
    ) : (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Reason</th>
              <th>Comment</th>
              <th>View</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {reports.map((report) => (
              <tr key={report._id}>
                <td>{report.productId}</td>

                <td>{report.reason}</td>

                <td>{report.comment}</td>

                <td>
                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      handleViewProduct(report.productId)
                    }
                  >
                    View
                  </button>
                </td>

                <td>
                  <button
                    className={styles.rejectBtn}
                    onClick={() =>
                      handleDeleteReport(
                        report._id,
                        report.productId
                      )
                    }
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </section>
)}

      {/* =========================
          VERIFICATION VIEW MODAL
      ========================= */}

      {selectedVerification && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedVerification(null)}
        >
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>Verification Documents</h2>
                <p>
                  {selectedVerification.idType} •{" "}
                  {selectedVerification.status}
                </p>
              </div>

              <button
                className={styles.closeBtn}
                onClick={() => setSelectedVerification(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.imageGrid}>
              <div className={styles.imageCard}>
                <span>SELFIE</span>

                <img
                  src={selectedVerification.selfieImage}
                  alt="User selfie"
                />
              </div>

              <div className={styles.imageCard}>
                <span>DOCUMENT FRONT</span>

                <img
                  src={selectedVerification.frontImage}
                  alt="Document front"
                />
              </div>

              <div className={styles.imageCard}>
                <span>DOCUMENT BACK</span>

                <img
                  src={selectedVerification.backImage}
                  alt="Document back"
                />
              </div>
            </div>

            <div className={styles.modalActions}>
                <button
                  className={styles.approveBtn}
                  disabled={processingVerification !== null}
                  onClick={() =>
                    handleApprove(selectedVerification)
                  }
                >
                  {processingVerification === "approve"
                    ? "Approving..."
                    : "✓ Approve Verification"}
                </button>

                <button
                  className={styles.rejectBtn}
                  disabled={processingVerification !== null}
                  onClick={() =>
                    openRejectModal(selectedVerification)
                  }
                >
                  {processingVerification === "reject"
                    ? "Rejecting..."
                    : "× Reject Verification"}
                </button>
              </div>
          </div>
        </div>
      )}

      {/* =========================
          REJECT MODAL
      ========================= */}

      {rejecting && (
        <div
          className={styles.modalOverlay}
          onClick={() => setRejecting(null)}
        >
          <div
            className={styles.rejectModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h2>Reject Verification</h2>
                <p>Please select a reason.</p>
              </div>

              <button
                className={styles.closeBtn}
                onClick={() => setRejecting(null)}
              >
                ×
              </button>
            </div>

            <div className={styles.reasonList}>
              {rejectReasons.map((reason) => (
                <label key={reason} className={styles.reasonItem}>
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason}
                    checked={rejectReason === reason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />

                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {rejectReason === "Other" && (
              <textarea
                className={styles.reasonInput}
                placeholder="Enter rejection reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={4}
              />
            )}

            <div className={styles.modalActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => setRejecting(null)}
              >
                Cancel
              </button>

              <button
                className={styles.rejectBtn}
                onClick={handleReject}
              >
                Reject Verification
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className={styles.footer}>
        © {new Date().getFullYear()} OnShopper Admin Panel
      </footer>
    </main>
  );
}