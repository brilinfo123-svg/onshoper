// contexts/ChatContext.js
import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export function ChatProvider({ children }) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [initialChatUser, setInitialChatUser] = useState(null);
  const [initialProduct, setInitialProduct] = useState(null);

  const openChat = (userData = null, productData = null) => {
    setInitialChatUser(userData);
    setInitialProduct(productData);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
    setInitialChatUser(null);
    setInitialProduct(null);
  };

  return (
    <ChatContext.Provider value={{
      isChatOpen,
      openChat,
      closeChat,
      initialChatUser,
      initialProduct
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};