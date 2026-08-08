"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Completed() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Completed Rentals</h2>

        <div className={styles.card}>
          <p>No completed rentals.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Completed);
