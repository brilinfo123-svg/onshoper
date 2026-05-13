import React, { useState } from "react";
import styles from "@/components/Tabs/Index.module.scss";

type Tab = {
  label: JSX.Element;
  content: React.ReactNode;
  className?: string;
};

interface TabsProps {
  tabs: Tab[];
}

const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        {tabs.map((tab, index) => (
          <button
            key={index}
            className={`
              ${styles.tabButton}
              ${activeTab === index ? styles.tabButtonActive : ""}
              ${tab.className || ""}
            `}
            onClick={() => setActiveTab(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;