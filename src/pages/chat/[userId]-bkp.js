import { useRouter } from "next/router";
import { getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import ChatBox from "@/components/ChatBox/Index";
import styles from "@/styles/chat.module.scss";


// Chat page par data receive karo
export default function ChatPage({ currentUserId, currentUserName }) {
    const router = useRouter();
    const { userId, sellerName, productId, productTitle } = router.query;
  
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton}>
            ← Back
          </button>
          <h1>Chat with {sellerName || "Seller"}</h1>
          {productTitle && <p>About: {productTitle}</p>}
        </div>
  
        <div className={styles.chatContainer}>
          <ChatBox
            currentUserId={currentUserId}
            currentUserName={currentUserName}
            otherUserId={userId}
            otherUserName={sellerName || "Seller"}
            productId={productId || ""}
            productTitle={productTitle || ""}
          />
        </div>
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

  return {
    props: {
      currentUserId: session.user.id,
    },
  };
}