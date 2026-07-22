"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import ChatListItem from "@/components/Chat/ChatListItem/Index";
import { useChat } from "@/contexts/ChatContext";
import styles from "./index.module.scss";
import { useSocket } from "@/contexts/SocketContext";
import ChatSidebarSkeleton from "@/components/Chat/ChatSidebar/ChatSidebarSkeleton/Index";
import Swal from "sweetalert2";
import router from "next/router";

export default function ChatSidebar() {
  const { socket } = useSocket();
  const { openChat, activeChat, closeChat, chats, fetchChats } = useChat();
  const { data: session, status } = useSession();

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ===============================
  // SOCKET MESSAGE LISTENER
  // ===============================
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      console.log("SIDEBAR MESSAGE:", message);
      fetchChats();
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };
  }, [socket]);

  // ===============================
  // INITIAL LOAD
  // ===============================
  useEffect(() => {
    const loadChats = async () => {
      if (status !== "authenticated") return;

      setLoading(true);
      await fetchChats();
      setLoading(false);
    };

    loadChats();
  }, [status]);

  // ===============================
  // DELETE CHAT
  // ===============================
  const deleteChat = async (chatId) => {
    const result = await Swal.fire({
      title: "Delete Chat?",
      text: "This will permanently delete the chat and all messages.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch("/api/chat/deleteChat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId,
          userId: session.user.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        await fetchChats();

        if (activeChat?._id === chatId) {
          closeChat();
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ===============================
  // SEARCH FILTER
  // ===============================
  const filteredChats = chats.filter((chat) => {
    const name = chat.otherUser?.name?.toLowerCase() || "";
    const last = chat.lastMessage?.message?.toLowerCase() || "";
    const query = search.toLowerCase();

    return name.includes(query) || last.includes(query);
  });

  return (
    <div className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <button aria-label="Go Home" className={`${styles.backBtn} icon-left-1`} onClick={() => router.push("/")}></button>
        <h2>Messages</h2>
      </div>

      {/* Search */}
      <div className={styles.search}>
        <input placeholder="Search chats" value={search} onChange={(e) => setSearch(e.target.value)}/>
      </div>

      {/* Chat List */}
      <div className={styles.chatList}>
        {loading ? (
          <ChatSidebarSkeleton />
        ) : (
          filteredChats.map((chat) => (
            <ChatListItem
              key={chat._id} chat={{
                ...chat,
                unreadCount:
                chat._id === activeChat?._id ? 0 : chat.unreadCount,
              }}
              onClick={async () => {await openChat(chat); await fetchChats();
              }} onDelete={() => deleteChat(chat._id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
