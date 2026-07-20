"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "@/components/Chat/MessageBubble/Index";
import { useChat } from "@/contexts/ChatContext";
import { useSession } from "next-auth/react";
import styles from "./index.module.scss";
import MessageSkeleton from "@/components/Chat/MessageList/MessageSkeleton/Index";

export default function MessageList() {
  const { activeChat, messages, setMessages } = useChat();
  const { data: session } = useSession();

  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  // ===============================
  // LOAD MESSAGES WHEN CHAT CHANGES
  // ===============================
  useEffect(() => {
    if (!activeChat) return;
    fetchMessages();
  }, [activeChat]);

  // ===============================
  // AUTO SCROLL TO BOTTOM
  // ===============================
  useEffect(() => {
    if (!chatContainerRef.current) return;

    chatContainerRef.current.scrollTo({
      top: chatContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // ===============================
  // FETCH MESSAGES
  // ===============================
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await fetch(`/api/chat/getMessages?chatId=${activeChat._id}`);
      const data = await res.json();

      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LAST OWN MESSAGE ID
  // ===============================
  const lastOwnMessageId =
    messages
      .filter((msg) => msg.senderId === session?.user?.id)
      .slice(-1)[0]?._id;

  return (
    <div className={styles.list} ref={chatContainerRef}>
      {loading ? (
        <MessageSkeleton />
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message._id}
            message={message}
            isOwn={message.senderId === session?.user?.id}
            isLastOwnMessage={message._id === lastOwnMessageId}
          />
        ))
      )}
    </div>
  );
}
