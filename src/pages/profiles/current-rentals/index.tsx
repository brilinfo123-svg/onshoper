"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function CurrentRentals() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Current Rentals</h2>

        <div className={styles.card}>
          <p>No current rentals.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(CurrentRentals);
