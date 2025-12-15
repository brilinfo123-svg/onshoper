// contexts/NotificationContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const useNotifications = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({});
  const [dbNotifications, setDbNotifications] = useState(0);
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const isOnChatPage = router.pathname.startsWith('/chat');

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('chatNotifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // ✅ Fetch notifications from DB + auto refresh
  useEffect(() => {
    let interval;

    const fetchNotifications = async () => {
      if (!session?.user?.id) return;
      try {
        const res = await fetch(`/api/notifications/${session.user.id}`);
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setDbNotifications(data.unreadCount || 0);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
    interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [session?.user?.id]);

  // ✅ Helper: send push notification via backend
  const sendPushNotification = async (receiverId, title, body) => {
    try {
      const res = await fetch(`/api/notifications/get-token?userId=${receiverId}`);
      const data = await res.json();
      const token = data?.token;

      if (!token) {
        console.warn("No FCM token found for receiver:", receiverId);
        return;
      }

      await fetch("/api/sendNotification/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, title, body }),
      });

      console.log("✅ Push notification sent to:", receiverId);
    } catch (err) {
      console.error("❌ Failed to send push notification:", err);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id || isOnChatPage) return;

    const newSocket = io("https://socket-server-gf0a.onrender.com", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("✅ Connected to notification server");
      setSocket(newSocket);
    });

    newSocket.on("receiveMessage", (message) => {
      const isOnSenderChatPage =
        router.pathname.startsWith("/chat/") &&
        router.query.userId === message.sender;

      const isIncoming =
        message.receiver === session.user.id &&
        message.sender !== session.user.id;

      if (isIncoming && !isOnSenderChatPage) {
        const saved = JSON.parse(localStorage.getItem("chatNotifications") || "{}");
        const currentCount = saved[message.sender] || 0;
        saved[message.sender] = currentCount + 1;
        localStorage.setItem("chatNotifications", JSON.stringify(saved));

        setNotifications((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));

        if (Notification.permission === "granted" && currentCount === 0) {
          new Notification("New Message", {
            body: `New message from ${message.senderName || "Someone"}`,
            icon: "/icon.png",
          });
        }

        if (currentCount === 0) {
          toast.info(`💬 New message from ${message.senderName || "Someone"}`, {
            position: "top-right",
            autoClose: 6000,
            theme: "colored",
            toastId: `message-${message.sender}-${Date.now()}`,
          });
        }

        // ✅ Also send push notification via FCM
        sendPushNotification(
          message.receiver, // 👈 receiver userId
          `${message.senderName} sent you a message`,
          message.message
        );
      }
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Disconnected from notification server");
    });

    newSocket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error);
    });

    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, [session?.user?.id, isOnChatPage, router]);

  const clearNotification = (userId) => {
    setNotifications(prev => {
      const newNotifications = { ...prev };
      delete newNotifications[userId];
      return newNotifications;
    });
  };

  const clearAllNotifications = () => {
    setNotifications({});
    setDbNotifications(0);
  };

  const getTotalNotifications = () => {
    const socketCount = Object.keys(notifications).length;
    return Math.max(dbNotifications, socketCount);
  };

  const value = {
    notifications,
    clearNotification,
    clearAllNotifications,
    getTotalNotifications
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
