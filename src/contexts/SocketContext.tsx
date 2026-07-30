"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  lastSeenUsers: { [userId: string]: string };
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  lastSeenUsers: {},
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [lastSeenUsers, setLastSeenUsers] = useState<Record<string, string>>({});

  // ===============================
  // INIT SOCKET
  // ===============================
  useEffect(() => {
    if (!session?.user?.id) return;

    let socketInstance: Socket;

    const initSocket = () => {
      const socketUrl =
        process.env.NODE_ENV === "development"
          ? undefined
          : process.env.NEXT_PUBLIC_SOCKET_URL;

      socketInstance = io(socketUrl, {
        path:
          process.env.NODE_ENV === "development"
            ? "/api/socket"
            : "/socket.io",
        transports: ["websocket"],
      });

      setSocket(socketInstance);

      // ===============================
      // CONNECTED
      // ===============================
      socketInstance.on("connect", () => {
        setIsConnected(true);

        console.log("✅ SOCKET CONNECTED:", socketInstance.id);

        socketInstance.emit("join", session.user.id);
      });

      // ===============================
      // RECEIVE ALL ONLINE USERS
      // ===============================
      socketInstance.on("onlineUsers", (users: string[]) => {
        console.log("🟢 ONLINE USERS:", users);
        setOnlineUsers(users);
      });

      // ===============================
      // USER ONLINE
      // ===============================
      socketInstance.on("userOnline", (data) => {
        console.log("🟢 USER ONLINE:", data.userId);

        setLastSeenUsers((prev) => {
          const updated = { ...prev };
          delete updated[String(data.userId)];
          return updated;
        });

        setOnlineUsers((prev) => {
          const id = String(data.userId);
          return prev.includes(id) ? prev : [...prev, id];
        });
      });

      // ===============================
      // USER OFFLINE
      // ===============================
      socketInstance.on("userOffline", (data) => {
        console.log("🔴 USER OFFLINE:", data.userId, data.lastSeen);

        setOnlineUsers((prev) =>
          prev.filter((id) => id !== String(data.userId))
        );

        setLastSeenUsers((prev) => ({
          ...prev,
          [String(data.userId)]: data.lastSeen,
        }));
      });

      // ===============================
      // DISCONNECTED
      // ===============================
      socketInstance.on("disconnect", (reason) => {
        console.log("❌ SOCKET DISCONNECTED:", reason);
        setIsConnected(false);
      });
    };

    initSocket();

    return () => {
      console.log("🧹 CLEAN SOCKET");

      if (socketInstance) {
        socketInstance.removeAllListeners();
        socketInstance.disconnect();
      }
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineUsers,
        lastSeenUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};