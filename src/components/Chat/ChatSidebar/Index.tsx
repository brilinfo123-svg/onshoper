"use client";

import {useEffect,useState} from "react";
import {useSession} from "next-auth/react";
import ChatListItem from "@/components/Chat/ChatListItem/Index";
import {useChat} from "@/contexts/ChatContext";
import styles from "./index.module.scss";
import {useSocket} from "@/contexts/SocketContext";
import Swal from "sweetalert2";
import router from "next/router";

export default function ChatSidebar(){

  const {socket}=useSocket();
  const [chats,setChats]=useState([]);
  const [search, setSearch] = useState("");   // ✅ ADD SEARCH STATE

  const {
    openChat,
    activeChat,
    closeChat
  }=useChat();

  const {data:session,status}=useSession();

  const fetchChats=async()=>{
    if(status!=="authenticated")return;

    try{
      const res=await fetch(`/api/chat/getChats?userId=${session.user.id}`);
      const data=await res.json();

      if(data.success){
        setChats(data.chats);
      }

    }catch(error){
      console.log(error);
    }
  };

  const deleteChat=async(chatId)=>{
    const result=await Swal.fire({
      title:"Delete Chat?",
      text:"This will permanently delete the chat and all messages.",
      icon:"warning",
      showCancelButton:true,
      confirmButtonColor:"#d33",
      cancelButtonColor:"#3085d6",
      confirmButtonText:"Yes, Delete",
      cancelButtonText:"Cancel"
    });

    if(!result.isConfirmed)return;

    try{
      const res=await fetch("/api/chat/deleteChat",{
        method:"DELETE",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify({ chatId, userId:session.user.id })
      });

      const data=await res.json();

      if(data.success){
        setChats(prev => prev.filter(chat => chat._id !== chatId));

        if(activeChat?._id === chatId){
          closeChat();
        }

        Swal.fire({
          title:"Deleted!",
          text:"Chat deleted successfully.",
          icon:"success",
          timer:1500,
          showConfirmButton:false
        });

      } else {
        Swal.fire({
          title:"Error",
          text:"Unable to delete chat.",
          icon:"error",
          confirmButtonText:"OK"
        });
      }

    }catch(error){
      console.log(error);

      Swal.fire({
        title:"Error",
        text:"Something went wrong.",
        icon:"error",
        confirmButtonText:"OK"
      });
    }
  };

  useEffect(()=>{
    if(!socket)return;

    const handleMessage=async(message)=>{
      const exists=chats.some(chat => chat._id === message.chatId);

      if(!exists){
        await fetchChats();
        return;
      }

      setChats(prev=>{
        const updated=prev.map(chat=>{
          if(chat._id !== message.chatId) return chat;

          return {
            ...chat,
            lastMessage: message,
            updatedAt: message.createdAt,
            unreadCount:
              activeChat?._id === message.chatId
                ? 0
                : (chat.unreadCount || 0) + 1
          };
        });

        updated.sort((a,b)=>
          new Date(b.updatedAt).getTime() -
          new Date(a.updatedAt).getTime()
        );

        return [...updated];
      });
    };

    socket.on("receiveMessage", handleMessage);

    return () => {
      socket.off("receiveMessage", handleMessage);
    };

  },[socket,activeChat,chats]);

  useEffect(()=>{
    if(status==="authenticated"){
      fetchChats();
    }
  },[status]);

  // ✅ FILTER CHATS BASED ON SEARCH
  const filteredChats = chats.filter(chat => {
    const name = chat.otherUser?.name?.toLowerCase() || "";
    const lastMsg = chat.lastMessage?.message?.toLowerCase() || "";
    const query = search.toLowerCase();

    return name.includes(query) || lastMsg.includes(query);
  });

  return(
    <div className={styles.sidebar}>

      <div className={styles.header}>
      <button className={`${styles.backBtn} ${"icon-left-1"}`} onClick={() => router.push("/")}></button>
        <h2>Messages</h2>
      </div>

      {/* ✅ WORKING SEARCH INPUT */}
      <div className={styles.search}>
        <input
          placeholder="Search chats"
          value={search}
          onChange={(e)=> setSearch(e.target.value)}
        />
      </div>

      <div className={styles.chatList}>
        {filteredChats.map(chat => (
          <ChatListItem
            key={chat._id}
            chat={{
              ...chat,
              unreadCount:
                chat._id === activeChat?._id
                  ? 0
                  : chat.unreadCount
            }}
            onClick={async()=>{
              await openChat(chat);

              setChats(prev =>
                prev.map(item =>
                  item._id === chat._id
                    ? { ...item, unreadCount: 0 }
                    : item
                )
              );
            }}
            onDelete={() => deleteChat(chat._id)}
          />
        ))}
      </div>

    </div>
  );
}
