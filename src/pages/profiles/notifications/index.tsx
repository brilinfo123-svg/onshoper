"use client";

import DashboardLayout from '@/components/ProfileDashboard/Layout/DashboardLayout';
import Notifications from '@/components/ProfileDashboard/Dashboard/Notifications';
import styles from './Index.module.scss';
import { withProtectedPage } from "@/components/withProtectedPage";

function NotificationsPage() {
  return (
    <DashboardLayout>
      <div className={styles.page}>
        <h2 className={styles.title}>Notifications</h2>

        <Notifications />
      </div>
    </DashboardLayout>
  );
}

// ✅ Wrap withProtectedPage before exporting
export default withProtectedPage(NotificationsPage);
