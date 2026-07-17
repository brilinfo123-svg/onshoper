"use client";

import Image from "next/image";
import styles from "./index.module.scss";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";

export default function ChatHeader({ user, onBack }) {
  const { onlineUsers } = useSocket();
  const { closeChat } = useChat();

  const isOnline = onlineUsers.includes(String(user?._id));

  return (
    <div className={styles.header}>

      {/* MOBILE BACK BUTTON */}
      <button
        className={styles.backBtn}
        onClick={onBack}
      >
        ←
      </button>

      <div className={styles.user}>
        <div className={styles.avatar}>
          {user?.photo ? (
            <Image
              src={user.photo}
              alt={user.name || "User"}
              width={45}
              height={45}
            />
          ) : (
            <div className={styles.initial}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        <div>
          <h3>{user?.name || "User"}</h3>
          <p>
            <span
              className={
                isOnline ? styles.onlineDot : styles.offlineDot
              }
            />
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
    </div>
  );
}
