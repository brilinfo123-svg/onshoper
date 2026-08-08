"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function DeleteAccount() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Delete Account</h2>

        <div className={styles.card}>
          <p>Are you sure you want to delete your account?</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(DeleteAccount);
