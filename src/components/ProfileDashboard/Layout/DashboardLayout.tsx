import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from '@/styles/profile/dashboard.module.scss';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles.content}>
      {isSidebarOpen && <Sidebar />}

      <div className={styles.main}>
        <Header onToggleSidebar={toggleSidebar} />
        <div className={styles.pageContent}>{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
