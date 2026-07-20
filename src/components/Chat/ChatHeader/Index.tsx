"use client";

import Image from "next/image";
import styles from "./index.module.scss";
import { useSocket } from "@/contexts/SocketContext";
import { useChat } from "@/contexts/ChatContext";

export default function ChatHeader({ user, onBack }) {

  const {
    onlineUsers,
    lastSeenUsers,
  } = useSocket();

  const { closeChat } = useChat();

  const isOnline = onlineUsers.includes(String(user?._id));

  const lastSeen =
    lastSeenUsers[String(user?._id)] ||
    user?.lastSeen;

  const formatLastSeen = (date) => {

    if (!date) {
      return "Offline";
    }

    return `Last seen ${new Date(date).toLocaleTimeString([],{
      hour:"2-digit",
      minute:"2-digit"
    })}`;

  };

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
                isOnline
                  ? styles.onlineDot
                  : styles.offlineDot
              }
            />

            {
              isOnline
                ? "Online"
                : formatLastSeen(lastSeen)
            }

          </p>

        </div>

      </div>

    </div>
  );

}