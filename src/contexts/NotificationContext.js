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
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Check if we're currently on a chat page
  const isOnChatPage = router.pathname.startsWith('/chat');

  // Load notifications from localStorage on component mount
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

  // Initialize socket connection for real-time notifications
  useEffect(() => {
    if (!session?.user?.id || isOnChatPage) return;

    const initializeSocket = () => {
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
        const isIncoming =
          message.receiver === session.user.id &&
          message.sender !== session.user.id;
      
        const isChatWithSenderOpen =
          isChatOpen && selectedChatUser?.id === message.sender;
      
        if (isIncoming && !isChatWithSenderOpen) {
          const currentCount = notifications[message.sender] || 0;
      
          setNotifications((prev) => ({
            ...prev,
            [message.sender]: currentCount + 1,
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
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: true,
              theme: "colored",
              toastId: `message-${message.sender}-${Date.now()}`,
              onClick: () => {
                setSelectedChatUser?.({
                  id: message.sender,
                  name: message.senderName || "Someone",
                });
                setIsChatOpen?.(true);
              },
            });
          }
        }
      });
      
    
      newSocket.on("disconnect", () => {
        console.log("❌ Disconnected from notification server");
      });
    
      newSocket.on("connect_error", (error) => {
        console.error("⚠️ Socket connection error:", error);
      });
    };
    

    initializeSocket();

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [session?.user?.id, isOnChatPage, router, notifications]); // Added notifications to dependencies

  // Clear notification for a specific chat
  const clearNotification = (userId) => {
    setNotifications(prev => {
      const newNotifications = { ...prev };
      delete newNotifications[userId];
      return newNotifications;
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications({});
  };

  const getTotalNotifications = () => {
    return Object.keys(notifications).length;
  };

  const getNotifications = () => {
    return notifications;
  };

  const value = {
    notifications: getNotifications(),
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