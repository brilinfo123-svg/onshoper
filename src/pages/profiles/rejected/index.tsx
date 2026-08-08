"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Rejected() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Rejected Requests</h2>

        <div className={styles.card}>
          <p>No rejected requests.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Rejected);
