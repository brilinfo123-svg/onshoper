"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [wishlistCount, setWishlistCount] = useState(0);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER || 'http://localhost:3001', {
      transports: ['websocket'],
    });
    
    setSocket(newSocket);

    // Listen for wishlist updates
    newSocket.on('wishlistUpdate', (data) => {
      if (data.userId === session?.user?.contact) {
        setWishlistCount(data.count);
      }
    });

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={{ socket, wishlistCount, setWishlistCount }}>
      {children}
    </SocketContext.Provider>
  );
};