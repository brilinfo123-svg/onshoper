"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Rental() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Rental Products</h2>

        <div className={styles.card}>
          <p>No rental products listed.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Rental);
