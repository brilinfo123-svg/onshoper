import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";
import styles from "./Index.module.scss";
import { useRouter } from "next/router";
import io from "socket.io-client";

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

    // Initialize socket connection
    const initializeSocket = async () => {
      try {
        // First ensure the socket API route exists
        await fetch("/api/socket");

        // Connect to socket.io
        socketRef.current = io();

        socketRef.current.on("connect", () => {
          console.log('Connected to socket server');
          setIsConnected(true);
          setError("");

          // Join the user's room for real-time updates
          socketRef.current.emit("join", session.user.id);
        });

        socketRef.current.on("receiveMessage", (msg) => {
          console.log("Received message via socket:", msg);

          if (selectedChat && (
            (msg.sender === session.user.id && msg.receiver === selectedChat.otherUserId) ||
            (msg.sender === selectedChat.otherUserId && msg.receiver === session.user.id)
          )) {
            // Add the message to current chat
            setMessages(prev => {
              const messageExists = prev.some(m => m._id === msg._id);
              if (!messageExists) {
                return [...prev, msg];
              }
              return prev;
            });

            // Refresh chats to update last message
            fetchChats();
          }
        });

        socketRef.current.on("disconnect", () => {
          console.log('Disconnected from socket server');
          setIsConnected(false);
        });

        socketRef.current.on("connect_error", (err) => {
          console.error('Socket connection error:', err);
          setIsConnected(false);
          setError("Real-time connection failed");
        });

      } catch (error) {
        console.error('Error initializing socket:', error);
        setIsConnected(false);
      }
    };

    initializeSocket();

    // Cleanup on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [session, selectedChat]);

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

  const selectChat = (chat) => {
    setSelectedChat(prev => ({
      ...chat,
      lastMessage: {
        ...chat.lastMessage,
        coverImage: chat?.lastMessage?.coverImage || prev?.lastMessage?.coverImage || initialProduct?.coverImage || null,
        otherUserName: chat?.lastMessage?.otherUserName || prev?.lastMessage?.otherUserName || initialProduct?.otherUserName || "Seller"
      },
      otherUser: {
        ...chat.otherUser,
        name: chat.otherUser?.name || prev?.otherUser?.name || initialProduct?.otherUserName || "Seller"
      }
    }));
    clearNotification(chat.otherUserId);
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
            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.messagesContainer} ref={messagesContainerRef}>
              {messagesLoading ? (
                <div className={styles.loading}>Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className={styles.noMessages}>No messages yet. Start a conversation!</div>
              ) : (
                <div className={styles.messagesList}>
                  {messages.map((message) => (
                    <div key={message._id} className={`${styles.message} ${message.sender === session.user.id ? styles.sent : styles.received}`}>
                      <div className={styles.messageContent}>
                        {/* {message.coverImage && (
                          <img src={message.coverImage} alt="Product" className={styles.messageImage} />
                        )} */}
                        {/* <p>{message.otherUserName || `User ${message.sender}`}</p> */}
                        {/* <span className={styles.senderName}>
                          {message.senderName || `User ${message.sender}`}
                        </span> */}
                        <p>{message.message}</p>
                        <span className={styles.messageTime}>
                          {formatMessageDate(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className={styles.messageInputContainer}>
              <div className={styles.inputWrapper}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  disabled={sendingMessage || !isConnected}
                  className={styles.messageInput}
                />
                <button
                  onClick={sendMessage}
                  disabled={sendingMessage || !newMessage.trim() || !isConnected}
                  className={styles.sendButton}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
              {!isConnected && (
                <span className={styles.connectionStatus}>Connecting...</span>
              )}
            </div>
          </div>
        ) : (
          // Chat List View
          <div className={styles.chatList}>
            {loading ? (
              <div className={styles.loading}>Loading chats...</div>
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