"use client";
import { useEffect, useState } from "react";
import styles from "./Admin.module.scss";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

export default function Home() {
  const router = useRouter();

  // ✅ Protect admin page
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (!isAdmin) {
      router.push("/admin/login"); // redirect if not logged in
    }
  }, [router]);

  const handleViewProduct = (id: string) => {
    router.push(`/product/${id}`); // navigate to product page
  };

  const [activeTab, setActiveTab] = useState<"approval" | "reports" | null>(null);
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "reports") {
      fetch("/api/reports")
        .then((res) => res.json())
        .then((data) => setReports(data));
    }
  }, [activeTab]);

  const handleLogout = () => {
    localStorage.removeItem("isAdmin"); // ❌ remove admin flag
    Swal.fire({
      title: "Logged Out",
      text: "You have been logged out successfully.",
      icon: "success",
      confirmButtonColor: "#ff6d01",
    }).then(() => {
      router.push("/admin/login"); // redirect to login page
    });
  };

  const handleDeleteProduct = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Deleting this product will also remove its reports!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await fetch(`/api/reports/${id}/delete`, { method: "DELETE" });
        if (res.ok) {
          setReports(reports.filter((r) => r.productId !== id));
          Swal.fire("Deleted!", "Product and its reports have been deleted.", "success");
        } else {
          Swal.fire("Error!", "Failed to delete product and reports.", "error");
        }
      }
    });
  };

  // Dummy data
  const products = [
    { id: "P001" },
    { id: "P002" },
    { id: "P003" },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome to Admin Dashboard</h1>
        <p>Discover amazing products by admin</p>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
      </header>

      <section className={styles.options}>
        <button onClick={() => setActiveTab("approval")} className={styles.optionBtn}>
          Approval Request of Product
        </button>
        <button onClick={() => setActiveTab("reports")} className={styles.optionBtn}>
          Watch All Reports of Products
        </button>
      </section>

      {activeTab === "approval" && (
        <section className={styles.tableSection}>
          <h2>Pending Product Approvals</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Approve</th>
                <th>Reject</th>
                <th>View Add</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td><button className={styles.viewBtn}>View</button></td>
                  <td><button className={styles.rejectBtn}>Reject</button></td>
                  <td><button className={styles.approveBtn}>Approve</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {activeTab === "reports" && (
        <section className={styles.tableSection}>
          <h2>Product Reports</h2>
          {reports.length === 0 ? (
            <p className={styles.noReports}>Not have reports</p>
          ) : (
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
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>{r.productId}</td>
                    <td>{r.reason}</td>
                    <td>{r.comment}</td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        onClick={() => handleViewProduct(r.productId)}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className={styles.rejectBtn}
                        onClick={() => handleDeleteProduct(r.productId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}

      <footer className={styles.footer}>
        <p>© {new Date().getFullYear()} My Store. All rights reserved.</p>
      </footer>
    </div>
  );
}
