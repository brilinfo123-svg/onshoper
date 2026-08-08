"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function Messages() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Messages</h2>

        <div className={styles.card}>
          <p>No messages found.</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(Messages);
