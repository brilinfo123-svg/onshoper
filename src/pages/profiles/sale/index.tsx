"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Sale() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Sale Products</h2>

        <div className={styles.card}>
          <p>No sale products listed.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Sale);
