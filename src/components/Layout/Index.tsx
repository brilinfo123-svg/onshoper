import { useChat } from '@/contexts/ChatContext';
import ChatSidebar from '@/components/ChatSidebar/Index';
import styles from './Index.module.scss';

export default function Layout({ children, hideOnOverlayClick = true }) {
  const { isChatOpen, closeChat, initialChatUser, initialProduct } = useChat();

  const handleOverlayClick = () => {
    if (hideOnOverlayClick) {
      closeChat();
    }
  };

  return (
    <div>
      {children}
      <ChatSidebar
        isOpen={isChatOpen}
        onClose={closeChat}
        initialChatUser={initialChatUser}
        initialProduct={initialProduct}
      />
      <div
        className={`${styles.overlay} ${isChatOpen ? styles.open : ''}`}
        onClick={handleOverlayClick}
      />
    </div>
  );
}
