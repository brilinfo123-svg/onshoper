"use client";
import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import styles from "./index.module.scss";

// Use a ref to maintain a single socket instance
let socket;

export default function ChatBox({ currentUserId, currentUserName, otherUserId, otherUserName, productId, productTitle }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isConnected, setIsConnected] = useState(false); // Add connection state
  const socketInitialized = useRef(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Function to scroll to bottom of messages container only
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Also scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/messages?userId=${currentUserId}&otherUserId=${otherUserId}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Messages load nahi ho paye");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();

    // Initialize socket only once
    if (!socketInitialized.current) {
      socketInitialized.current = true;
      
      fetch("/api/socket").then(() => {
        socket = io();

        socket.on("connect", () => {
          console.log('Connected to notification server');
          setIsConnected(true);
          setError(""); // Clear any previous connection errors
        });

        socket.on("receiveMessage", (msg) => {
          if (
            (msg.sender === currentUserId && msg.receiver === otherUserId) ||
            (msg.sender === otherUserId && msg.receiver === currentUserId)
          ) {
            // Check if message already exists to prevent duplicates
            setMessages((prev) => {
              const messageExists = prev.some(m => 
                m._id === msg._id || 
                (m.sender === msg.sender && 
                 m.message === msg.message && 
                 Math.abs(new Date(m.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 1000)
              );
              
              if (!messageExists) {
                return [...prev, msg];
              }
              return prev;
            });
          }
        });

        socket.on("disconnect", () => {
          console.log('Disconnected from notification server');
          setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
          console.error('Socket connection error:', err);
          setIsConnected(false);
          setError("Real-time connection failed");
        });

        socket.on("reconnect", (attemptNumber) => {
          console.log('Reconnected to server');
          setIsConnected(true);
          setError(""); // Clear error on reconnect
        });
      });
    }

    return () => {
      // Don't disconnect socket here to maintain connection between component re-renders
    };
  }, [currentUserId, otherUserId]);

  const sendMessage = async () => {
    if (!newMsg.trim()) return;
  
    const msg = {
      sender: currentUserId,
      receiver: otherUserId,
      message: newMsg,
      productId: productId,
      productTitle: productTitle,
    };
  
    try {
      setNewMsg(""); // Optimistic update
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(msg),
      });
  
      if (res.ok) {
        const savedMessage = await res.json();
        
        // Add the message to state only if it doesn't already exist
        setMessages((prev) => {
          const messageExists = prev.some(m => m._id === savedMessage._id);
          if (!messageExists) {
            return [...prev, savedMessage];
          }
          return prev;
        });
        
        if (socket && socket.connected) {
          socket.emit("sendMessage", savedMessage);
        }
      } else {
        setNewMsg(msg.message); // Restore message if failed
        console.error("Failed to send:", await res.json());
        setError("Message send nahi ho paya");
      }
    } catch (err) {
      setNewMsg(msg.message); // Restore message if failed
      console.error("Error sending message:", err);
      setError("Message send nahi ho paya");
    }
  };

  if (isLoading) {
    return <div className={styles.chatbox}>Loading messages...</div>;
  }

  return (
    <div className={styles.chatbox}>
      <div className={styles.chatHeader}>
        <h3>Chat with {otherUserName}</h3>
        {productTitle && <p>About: {productTitle}</p>}
        {/* Connection status indicator in header */}
        <span className={`${styles.connectionStatus} ${isConnected ? styles.connected : styles.disconnected}`}>
          {isConnected ? '🟢 Online' : '🔴 Offline'}
        </span>
      </div>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.messages} ref={messagesContainerRef}>
        {messages.length === 0 ? (
          <p className={styles.noMessages}>No messages yet. Start the conversation!</p>
        ) : (
          messages.map((m, idx) => (
            <div
              key={m._id || `${m.sender}-${m.createdAt}-${idx}`}
              className={`${styles.message} ${m.sender === currentUserId ? styles.sent : styles.received}`}
            >
              <div className={styles.messageContent}>{m.message}</div>
              <div className={styles.messageMeta}>
                {new Date(m.createdAt).toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {/* Invisible element at the bottom to help with scrolling */}
        <div ref={messagesEndRef} style={{ float: "left", clear: "both" }} />
      </div>
  
      <div className={styles.inputBox}>
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type your message..."
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          // Removed disabled from input - user can always type
        />
        <button onClick={sendMessage} disabled={!newMsg.trim() || !isConnected}>
          Send
        </button>
        {!isConnected && (
          <span className={styles.connectionStatus}>Connecting...</span>
        )}
      </div>
    </div>
  );
}