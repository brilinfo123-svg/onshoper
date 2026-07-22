"use client";

import { useState } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useSession } from "next-auth/react";
import styles from "./index.module.scss";

export default function ChatInput() {
  const { activeChat, addMessage, socket } = useChat();
  const { data: session } = useSession();

  const [text, setText] = useState("");

  // ===============================
  // SEND MESSAGE
  // ===============================
  const sendMessage = async () => {
    if (!text.trim() || !activeChat || !session) return;

    const receiverId =
      activeChat.otherUser?._id ||
      (activeChat.buyer === session.user.id
        ? activeChat.seller
        : activeChat.buyer);

    if (!receiverId) return;

    const messageData = {
      chatId: activeChat._id,
      senderId: session.user.id,
      receiverId,
      message: text,
    };

    try {
      const res = await fetch("/api/chat/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(messageData),
      });

      const data = await res.json();

      if (data.success) {
        addMessage(data.message);

        socket.emit("sendMessage", {
          ...data.message,
          senderId: session.user.id,
          receiverId,
        });

        setText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={styles.inputBox}>
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
      />
      <button aria-label="Send Message" onClick={sendMessage}>Send</button>
    </div>
  );
}
