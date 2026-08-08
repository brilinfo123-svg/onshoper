"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Deposits() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Security Deposits</h2>

        <div className={styles.card}>
          <p>No deposits found.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Deposits);
