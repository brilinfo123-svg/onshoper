"use client";

import {useEffect,useRef} from "react";
import MessageBubble from "@/components/Chat/MessageBubble/Index";
import {useChat} from "@/contexts/ChatContext";
import {useSession} from "next-auth/react";
import styles from "./index.module.scss";

export default function MessageList(){

const {activeChat,messages,setMessages}=useChat();

const {data:session}=useSession();

const chatContainerRef=useRef(null);

useEffect(()=>{

if(!activeChat)return;

fetchMessages();

},[activeChat]);

useEffect(() => {
  if (!chatContainerRef.current) return;

  chatContainerRef.current.scrollTo({
    top: chatContainerRef.current.scrollHeight,
    behavior: "smooth",
  });
}, [messages]);


const fetchMessages=async()=>{

try{

const res=await fetch(
`/api/chat/getMessages?chatId=${activeChat._id}`
);

const data=await res.json();

if(data.success){

setMessages(data.messages);

}

}catch(error){

console.log(error);

}

};

// Find the last message sent by the current user
const lastOwnMessageId = messages
  .filter((message) => message.senderId === session.user.id)
  .slice(-1)[0]?._id;

return(

<div
className={styles.list}
ref={chatContainerRef}
>

{
messages.map((message)=>(

<MessageBubble
key={message._id}
message={message}
isOwn={message.senderId===session.user.id}
isLastOwnMessage={message._id===lastOwnMessageId}
/>

))
}

</div>

);

}