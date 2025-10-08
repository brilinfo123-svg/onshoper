// pages/chats/index.js
import { useRouter } from "next/router";
import { getSession, useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import connectToDatabase from "@/lib/mongodb";
import Message from "../../models/Message";
import User from "../../models/User";
import styles from "@/styles/chat.module.scss";
import { useNotifications } from "@/contexts/NotificationContext";

export default function AllChatsPage({ chats, currentUserId }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [deletingChats, setDeletingChats] = useState({});
  const [allChats, setAllChats] = useState(chats);
  const { notifications, clearNotification } = useNotifications();

  console.log("Chate", allChats, "session", session);

  // Format date consistently on client side
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const openChat = (chat) => {
    // Clear notification for this specific chat when opening
    clearNotification(chat.otherUserId);

    router.push({
      pathname: `/chat/${chat.otherUserId}`,
      query: {
        sellerName: chat.otherUser?.name || `User ${chat.otherUserId}`,
        productTitle: chat.lastMessage?.productTitle || ""
      }
    });
  };

  const deleteChat = async (otherUserId) => {
    if (!confirm("Are you sure you want to delete this chat? This will remove the chat from your view, but the other user will still see it.")) {
      return;
    }

    setDeletingChats(prev => ({ ...prev, [otherUserId]: true }));

    try {
      const response = await fetch('/api/messages/hide-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId,
          otherUserId
        }),
      });

      if (response.ok) {
        // Remove the chat from local state
        setAllChats(prevChats => prevChats.filter(chat => chat.otherUserId !== otherUserId));
        // Clear any notifications for this chat
        clearNotification(otherUserId);
      } else {
        console.error('Failed to hide chat');
        alert('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Error hiding chat:', error);
      alert('Error deleting chat. Please try again.');
    } finally {
      setDeletingChats(prev => ({ ...prev, [otherUserId]: false }));
    }
  };

  return (
    <div className={styles.container}>
      <h1>Your Chats</h1>
      
      {allChats.length === 0 ? (
        <p>No chats yet</p>
      ) : (
        <div className={styles.chatList}>
          {allChats.map((chat, index) => (
            <div  className={styles.chatItem}>
              <div className={styles.userInfo} key={index} onClick={() => openChat(chat)}>
                <h3>
                  {chat.otherUser?.name || `User ${chat.otherUserId}`}
                  | {chat.lastMessage?.productTitle && (
                  <p className={styles.productTitle}>
                    About: {chat.lastMessage.productTitle}
                  </p>
                )}

                  {/* Show notification badge if this user has a notification */}
                  {notifications[chat.otherUserId] && (
                    <span className={styles.notificationBadge}>
                      1
                    </span>
                  )}
                </h3>
                <p className={styles.lastMessage}>
                  {chat.lastMessage?.message || "No messages yet"}
                </p>
                
                <div className={styles.time}>
                  {formatDate(chat.lastMessage?.createdAt)}
                </div>
              </div>
              <div className={styles.chatMeta}>
                
                {chat.messageCount > 0 && (
                  <div className={styles.messageCount}>
                    {chat.messageCount} message{chat.messageCount !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
              <div className={styles.chatActions}>
                {/* <button  onClick={() => openChat(chat)} className={`${styles.chatLink} ${""}`}>
                  Open Chat
                </button> */}
                <button  onClick={() => deleteChat(chat.otherUserId)} className={`${styles.deleteButton} ${"icon-trash-delete"}`} disabled={deletingChats[chat.otherUserId]}>
                  {deletingChats[chat.otherUserId] ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  await connectToDatabase();
  
  // Current user ki saari chats find karo (only non-hidden ones)
  const messages = await Message.find({
    $or: [
      { sender: session.user.id, hiddenForSender: { $ne: true } },
      { receiver: session.user.id, hiddenForReceiver: { $ne: true } }
    ]
  }).sort({ createdAt: -1 });

  // Different users ke saath ki chats group karo
  const chatMap = {};
  
  for (const msg of messages) {
    const otherUserId = msg.sender === session.user.id ? msg.receiver : msg.sender;
    
    if (!chatMap[otherUserId]) {
      chatMap[otherUserId] = {
        otherUserId,
        messages: []
      };
      
      // Fetch user information for each chat participant
      try {
        const user = await User.findById(otherUserId).select('name');
        chatMap[otherUserId].otherUser = user;
      } catch (error) {
        console.error(`Error fetching user ${otherUserId}:`, error);
        chatMap[otherUserId].otherUser = null;
      }
    }
    
    chatMap[otherUserId].messages.push(msg);
  }

  // Chat list banayein with proper IDs
  const chats = Object.values(chatMap).map(chat => ({
    id: chat.otherUserId, // Unique ID for each chat
    otherUserId: chat.otherUserId,
    otherUser: chat.otherUser ? {
      name: chat.otherUser.name
    } : null,
    lastMessage: chat.messages[0] ? {
      message: chat.messages[0].message,
      productTitle: chat.messages[0].productTitle,
      createdAt: chat.messages[0].createdAt.toISOString() // Convert to string for serialization
    } : null,
    messageCount: chat.messages.length
  }));

  return {
    props: {
      chats: JSON.parse(JSON.stringify(chats)),
      currentUserId: session.user.id
    },
  };
}