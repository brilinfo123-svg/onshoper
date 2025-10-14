"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({});
  const [socket, setSocket] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  const isOnChatPage = router.pathname.startsWith('/chat');

  // Load notifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatNotifications');
    if (saved) setNotifications(JSON.parse(saved));
  }, []);

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('chatNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // ✅ Initialize socket connection
  useEffect(() => {
    if (!session?.user?.id || isOnChatPage) return;

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://socket-server-gf0a.onrender.com', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('✅ Connected to notification server');
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Disconnected from notification server');
    });

    socketInstance.on('connect_error', (err) => {
      console.error('⚠️ Socket connection error:', err.message);
    });

    // ✅ Handle incoming messages
    socketInstance.on('receiveMessage', (message) => {
      const isOnSenderChatPage =
        router.pathname.startsWith('/chat/') &&
        router.query.userId === message.sender;

      const isIncoming =
        message.receiver === session.user.id &&
        message.sender !== session.user.id;

      if (isIncoming && !isOnSenderChatPage) {
        const currentCount = notifications[message.sender] || 0;

        setNotifications((prev) => ({
          ...prev,
          [message.sender]: currentCount + 1,
        }));

        if (Notification.permission === 'granted' && currentCount === 0) {
          new Notification('New Message', {
            body: `New message from ${message.senderName || 'Someone'}`,
            icon: '/icon.png',
          });
        }

        toast.info(`💬 New message from ${message.senderName || 'Someone'}`, {
          position: 'top-right',
          autoClose: 6000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: true,
          theme: 'colored',
          toastId: `message-${message.sender}-${Date.now()}`,
          onClick: () => {
            router.push(`/chat/${message.sender}`);
          },
        });
      }
    });

    // ✅ Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id, isOnChatPage, router]);

  // ✅ Clear notification for a specific chat
  const clearNotification = (userId) => {
    setNotifications((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  };

  const clearAllNotifications = () => setNotifications({});

  const getTotalNotifications = () => Object.keys(notifications).length;

  const getNotifications = () => notifications;

  const value = {
    notifications: getNotifications(),
    clearNotification,
    clearAllNotifications,
    getTotalNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
