"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Settings() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Settings</h2>

        <div className={styles.card}>
          <p>Update your account settings.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Settings);
