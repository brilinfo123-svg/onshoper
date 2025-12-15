import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./Index.module.scss";
import { useRouter } from "next/router";
import { io } from "socket.io-client";
import SkeletonChatItem from "@/components/SkeletonChatItem/Index";

const socketURL = "https://socket-server-gf0a.onrender.com";

export default function ChatSidebar({ isOpen,
  onClose,
  initialChatUser = null,  // Add this prop
  initialProduct = null    // Add this prop
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    photo: "",
    email: "",
    mobile: "",
    contact: ""
  });

  const [receiverInfo, setReceiverInfo] = useState({
    name: "", 
    photo: "",
    contact: "" 
  });

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [deletingChats, setDeletingChats] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);
  const { notifications, clearNotification } = useNotifications();
  const [receiverMap, setReceiverMap] = useState({});
  const [receiverFcmToken, setReceiverFcmToken] = useState(null);

  const socketURL = "https://socket-server-gf0a.onrender.com";
  

// 👆 state

useEffect(() => {
  const fetchReceiverToken = async () => {
    if (!selectedChat?.otherUserId) return; // 👈 wait until chat selected

    try {
      // 👈 dynamically use receiver contact
      const res = await fetch(`/api/notifications/get-token?contact=${selectedChat.otherUserId}`);
      const data = await res.json();

      if (res.ok && data?.token) {
        setReceiverFcmToken(data.token);
        // console.log("🔔 Receiver FCM Token:", data.token);
      } else {
        console.warn("⚠️ No token found for receiver:", selectedChat.otherUserId);
      }
    } catch (err) {
      console.error("❌ Error fetching receiver token:", err);
    }
  };

  fetchReceiverToken();
}, [selectedChat]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!session?.user?.contact) return;

      try {
        const res = await fetch(`/api/users/byContact?contact=${session.user.contact}`);
        const data = await res.json();
        if (res.ok) {
          setUserInfo(data);
        } else {
          console.error("User fetch failed:", data.error);
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    };

    fetchUserInfo();
  }, [session]);

  useEffect(() => {
    if (initialChatUser && initialProduct && isOpen) {
      const existingChat = chats.find(chat =>
        chat.otherUserId === initialChatUser.id
      );

      if (existingChat) {
        setSelectedChat(existingChat);
      } else {
        setSelectedChat({
          otherUserId: initialChatUser.id,
          otherUser: {
            name: initialChatUser.name,
          },
          lastMessage: {
            productTitle: initialProduct.title,
            productId: initialProduct.id,
            coverImage: selectedChat?.lastMessage?.coverImage || initialProduct?.coverImage || null,
            otherUserName: selectedChat?.otherUser?.name || selectedChat?.lastMessage?.otherUserName || initialProduct?.otherUserName || "Seller"
          },
          productId: initialProduct.id,
          isNewChat: true
        });
        setMessages([]);
      }
    }
  }, [initialChatUser, initialProduct, isOpen, chats]);

  const fetchReceiverInfo = async (contact) => {
    if (receiverMap[contact]) return; // Avoid duplicate fetches
  
    try {
      const res = await fetch(`/api/users/byContact?contact=${contact}`);
      const data = await res.json();
      if (res.ok) {
        setReceiverMap(prev => ({
          ...prev,
          [contact]: {
            name: data.name || `User`,
            photo: data.photo || "/icons/profile.png",
            contact: data.contact
          }
        }));
      } else {
        console.error("Receiver fetch failed:", data.error);
      }
    } catch (err) {
      console.error("Error fetching receiver info:", err);
    }
  };
  
  
  useEffect(() => {
    if (selectedChat?.otherUserId) {
      fetchReceiverInfo(selectedChat.otherUserId);
    }
  }, [selectedChat]);

  // Function to scroll to bottom of messages container
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (isOpen && session) {
      fetchChats();
    }
  }, [isOpen, session]);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.otherUserId);
    }
  }, [selectedChat]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io connection management

  
  useEffect(() => {
    if (!session?.user?.id) return;
  
    // ✅ Use ref to persist socket instance across renders
  
    // ✅ Initialize socket only once
    if (!socketRef.current) {
      socketRef.current = io(socketURL, {
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });
  
      socketRef.current.on("connect", () => {
        console.log("✅ Connected to socket server");
        setIsConnected(true);
        setError("");
        socketRef.current.emit("join", session.user.id);
      });
  
      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from socket server");
        setIsConnected(false);
      });
  
      socketRef.current.on("connect_error", (err) => {
        console.error("⚠️ Socket connection error:", err);
        setIsConnected(false);
        setError("Real-time connection failed");
      });
    }
  
    // ✅ Scoped message listener for current chat
    const handleMessage = (msg) => {
      console.log("📩 Received message:", msg);
  
      const isCurrentChat =
        selectedChat &&
        ((msg.sender === session.user.id && msg.receiver === selectedChat.otherUserId) ||
          (msg.sender === selectedChat.otherUserId && msg.receiver === session.user.id));
  
      if (isCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === msg._id);
          return exists ? prev : [...prev, msg];
        });
  
        fetchChats();
      }
    };
  
    // ✅ Attach listener only when selectedChat changes
    socketRef.current.on("receiveMessage", handleMessage);
  
    // ✅ Cleanup listener on chat change
    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage", handleMessage);
      }
    };
  }, [session?.user?.id, selectedChat]);
  

  const fetchChats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chats/sidebar');
      if (response.ok) {
        const data = await response.json();
  
        // Sort chats by latest message timestamp (descending)
        const sortedChats = data.chats.sort((a, b) => {
          const timeA = new Date(a.lastMessage?.createdAt || 0).getTime();
          const timeB = new Date(b.lastMessage?.createdAt || 0).getTime();
          return timeB - timeA;
        });
  
        setChats(sortedChats);
  
        // Fetch receiver info for each chat
        sortedChats.forEach(chat => {
          fetchReceiverInfo(chat.otherUserId);
        });
      } else {
        console.error('Failed to fetch chats');
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };
  

  const fetchMessages = async (otherUserId) => {
    try {
      setMessagesLoading(true);
      const response = await fetch(`/api/messages?userId=${session.user.id}&otherUserId=${otherUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } else {
        console.error('Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };


  const senderName = userInfo.name || "User";
  const senderPhoto = userInfo.photo || "/default.jpg";

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    if (!session || !session.user || !session.user.id) {
      console.error('No session available');
      alert('Please login again');
      return;
    }

    const msg = {
      sender: session.user.id,
      senderName,
      receiver: selectedChat.otherUserId,
      message: newMessage.trim(),
      productId: selectedChat.productId || null,
      productTitle: selectedChat.lastMessage?.productTitle || "Product",
      coverImage: selectedChat.lastMessage?.coverImage || initialProduct?.coverImage || null,
      otherUserName: selectedChat?.otherUser?.name || selectedChat?.lastMessage?.otherUserName || initialProduct?.otherUserName || "Seller"
    };

    setSendingMessage(true);
    try {
      // Optimistically update UI
      const tempMessage = {
        _id: Date.now().toString(), // Temporary ID
        ...msg,
        createdAt: new Date().toISOString()
      };

      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });

      if (response.ok) {
        const savedMessage = await response.json();

        // Replace temporary message with actual saved message
        setMessages(prev =>
          prev.map(m => m._id === tempMessage._id ? savedMessage : m)
        );

        // Emit via socket for real-time
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("sendMessage", savedMessage);
        }
        await fetch("/api/sendNotification/send-notification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: receiverFcmToken,   // 👈 receiver ka FCM token (DB se)
            title: `${senderName} sent you a message`,
            body: newMessage.trim(),
          }),
        });
        console.log("Saved message before socket emit:", savedMessage);
        // Refresh chats to update last message
        fetchChats();
      } else {
        // Remove the optimistic message if failed
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
        setNewMessage(msg.message);
        console.error("Failed to send:", await response.json());
        setError("Failed to send message");
      }
    } catch (error) {
      // Remove the optimistic message if error
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id));
      setNewMessage(msg.message);
      console.error('Error sending message:', error);
      setError('Error sending message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const formatMessageDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const selectChat = async (chat) => {
    // ✅ Set selected chat (existing logic preserved)
    setSelectedChat(prev => ({
      ...chat,
      lastMessage: {
        ...chat.lastMessage,
        coverImage:
          chat?.lastMessage?.coverImage ||
          prev?.lastMessage?.coverImage ||
          initialProduct?.coverImage ||
          null,
        otherUserName:
          chat?.lastMessage?.otherUserName ||
          prev?.lastMessage?.otherUserName ||
          initialProduct?.otherUserName ||
          "Seller",
      },
      otherUser: {
        ...chat.otherUser,
        name:
          chat.otherUser?.name ||
          prev?.otherUser?.name ||
          initialProduct?.otherUserName ||
          "Seller",
      },
    }));
  
    // ✅ Clear local notification badge
    clearNotification(chat.otherUserId);
  
    // 🔔 ✅ FETCH RECEIVER FCM TOKEN (NEW)
    try {
      const tokenRes = await fetch(
        `/api/notifications/get-token?userId=${chat.otherUserId}`
      );
      const tokenData = await tokenRes.json();
      setReceiverFcmToken(tokenData?.token || null);
      // console.log("🔔 Receiver FCM Token:", tokenData?.token);
    } catch (err) {
      console.error("❌ Failed to fetch receiver FCM token:", err);
      setReceiverFcmToken(null);
    }
  
    // ✅ Mark messages as read in DB
    if (session?.user?.id) {
      try {
        const res = await fetch("/api/messages/markAsRead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: session.user.id,
            otherUserId: chat.otherUserId,
          }),
        });
  
        if (res.ok) {
          // ✅ Update badge instantly
          if (typeof setDbNotifications === "function") {
            setDbNotifications(prev => Math.max(prev - 1, 0));
          }
        }
      } catch (err) {
        console.error("❌ Failed to mark messages as read:", err);
      }
    }
  };
  
  
  


  const goBackToList = () => {
    setSelectedChat(null);
    setMessages([]);
  };

  const deleteChat = async (otherUserId, e) => {
    e.stopPropagation();
  
    if (!confirm("Are you sure you want to permanently delete this chat?")) {
      return;
    }
  
    setDeletingChats(prev => ({ ...prev, [otherUserId]: true }));
  
    try {
      const response = await fetch('/api/messages/delete-chat', {
        method: 'POST', // keep POST since your API expects POST
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentUserId: session.user.id,
          otherUserId
        }),
      });
  
      if (response.ok) {
        // Remove chat from UI
        setChats(prevChats => prevChats.filter(chat => chat.otherUserId !== otherUserId));
        clearNotification(otherUserId);
  
        // If currently viewing this chat, go back to list
        if (selectedChat && selectedChat.otherUserId === otherUserId) {
          goBackToList();
        }
      } else {
        console.error('Failed to delete chat');
        alert('Failed to delete chat. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Error deleting chat. Please try again.');
    } finally {
      setDeletingChats(prev => ({ ...prev, [otherUserId]: false }));
    }
  };
  

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        {selectedChat ? (
          <div className={styles.chatHeader}>
            <button className={styles.backButton} onClick={goBackToList}>
              ←
            </button>
            <div className={styles.chatUserInfo}>
            <div className={styles.userChatList}>
            <img src={receiverMap[selectedChat.otherUserId]?.photo || "/icons/profile.png"}
                alt={receiverMap[selectedChat.otherUserId]?.name || `User`}
                className={styles.senderAvatar}
              />
              <div className={styles.userDetails}>
              <h3>{receiverMap[selectedChat.otherUserId]?.name || `User`}</h3>
                {selectedChat.lastMessage?.productTitle && (
                  <p className={styles.productTitle}>
                    About: {selectedChat.lastMessage.productTitle}
                  </p>
                )}
                
              </div>
              <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
                  {isConnected ? '🟢 Online' : '🔴 Offline'}
                </span>
          </div>
              
{/* 
              <div className={styles.imageWrapper}>
                <img
                  src={selectedChat.lastMessage?.coverImage || initialProduct?.coverImage ||
                    "/icons/profile.png"
                  }
                  alt="Product"
                  className={styles.productImage}
                />
              </div> */}
            </div>
          </div>
        ) : (
          <h2>Your Chats</h2>
        )}


        <button className={styles.closeButton} onClick={onClose}>×</button>
      </div>

      <div className={styles.sidebarContent}>
        {selectedChat ? (
          // Chat View
          <div className={styles.chatContainer}>
            {/* {error && <div className={styles.error}>{error}</div>} */}

            <div className={styles.messagesContainer} ref={messagesContainerRef}>
              <div className={styles.messagesList}>
                {messagesLoading ? (
                 <div className={styles.fetchingText}>Fetching messages<span>.</span><span>.</span><span>.</span></div>             
                ) : messages.length === 0 ? (
                  <div className={styles.noMessages}>No messages yet. Start a conversation!</div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div
                        key={message._id}
                        className={`${styles.message} ${
                          message.sender === session.user.id ? styles.sent : styles.received
                        }`}
                      >
                        <div className={styles.messageContent}>
                          <p>{message.message}</p>
                          <span className={styles.messageTime}>
                            {formatMessageDate(message.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>


            <div className={styles.messageInputContainer}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  // disabled={sendingMessage || !isConnected}
                  className={styles.messageInput}
                />
                <button
                  onClick={sendMessage}
                  // disabled={sendingMessage || !newMessage.trim() || !isConnected}
                  className={styles.sendButton}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
              {/* {!isConnected && (
                <span className={styles.connectionStatus}>Connecting...</span>
              )} */}
            </div>
          </div>
        ) : (
          // Chat List View
          <div className={styles.chatList}>
            {loading ? (
              <SkeletonChatItem />
            ) : chats.length === 0 ? (
              <div className={styles.noChats}>No chats yet</div>
            ) : (
              chats.map((chat, index) => (
                <div key={index} className={styles.chatItem} onClick={() => selectChat(chat)}>
                    <div className={styles.chatPreview}>
                    <img src={receiverMap[chat.otherUserId]?.photo || "/icons/profile.png"}
                      alt={receiverMap[chat.otherUserId]?.name || `User`}
                      className={styles.chatThumbnail}
                    />
                    {notifications[chat.otherUserId] && (
                      <span className={styles.unreadBadge}>
                        {notifications[chat.otherUserId]}
                      </span>
                    )}
                    


                      <div className={styles.chatDetails}>
                      <h4 className={styles.userName}>{receiverMap[chat.otherUserId]?.name || `User`}</h4>
                        {/* <h4 className={styles.userName}>
                          {receiverInfo.name || `User ${chat.otherUserId}`}
                        </h4> */}
                        <div className={styles.ChatAboutTime}>
                        {chat.lastMessage?.productTitle && (
                          <p className={styles.productTitle}>
                            About: {chat.lastMessage.productTitle}
                          </p>
                        )}

                        {/* <p className={styles.lastMessage}>
                          {chat.lastMessage?.message || "No messages yet"}
                        </p> */}

                        <span className={styles.time}>
                          {formatDate(chat.lastMessage?.createdAt)}
                        </span>
                        </div>
                      </div>
                    </div>

                    <button
                      className={styles.deleteButton}
                      onClick={(e) => deleteChat(chat.otherUserId, e)}
                      disabled={deletingChats[chat.otherUserId]}
                    >
                      {deletingChats[chat.otherUserId] ? '...' : '✕'}
                    </button>
                  </div>

              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}