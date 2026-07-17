"use client";

import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import ChatHeader from "@/components/Chat/ChatHeader/Index";
import SafetyBanner from "@/components/Chat/SafetyBanner/Index";
import MessageList from "@/components/Chat/MessageList/Index";
import ChatInput from "@/components/Chat/ChatInput/Index";
import styles from "./index.module.scss";

export default function ChatWindow() {
  const { activeChat, closeChat } = useChat();
  const [isClosing, setIsClosing] = useState(false);

  if (!activeChat) {
    return (
      <div className={styles.empty}>
        <h3>Select a chat to start messaging</h3>
      </div>
    );
  }

  const handleBack = () => {
    setIsClosing(true);

    setTimeout(() => {
      closeChat();
      setIsClosing(false);
    }, 350); // match animation duration
  };

  return (
    <div
      className={`${styles.window} ${
        isClosing ? styles.windowSlideOut : styles.windowSlideIn
      }`}
    >
      <ChatHeader user={activeChat.otherUser} onBack={handleBack} />
      <SafetyBanner />
      <MessageList />
      <ChatInput />
    </div>
  );
}
