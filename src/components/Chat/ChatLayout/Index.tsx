"use client";

import ChatSidebar from "@/components/Chat/ChatSidebar/Index";
import ChatWindow from "@/components/Chat/ChatWindow/Index";
import styles from "./index.module.scss";
import { useChat } from "@/contexts/ChatContext";

export default function ChatLayout() {
  const { activeChat } = useChat();

  const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

  return (
    <div className={styles.chatLayout}>

      {/* SIDEBAR */}
      <div className={isMobile && activeChat ? styles.hideMobile : styles.sidebar}>
        <ChatSidebar />
      </div>

      {/* WINDOW */}
      <div className={isMobile && activeChat ? styles.showMobile : styles.window}>
        <ChatWindow />
      </div>

    </div>
  );
}
