"use client";

import Image from "next/image";
import styles from "./index.module.scss";
import {useSocket} from "@/contexts/SocketContext";

export default function ChatListItem({
chat,
onClick,
onDelete
}){

const user=chat.otherUser;

const {onlineUsers}=useSocket();

const isOnline=
onlineUsers.includes(
String(user?._id)
);


return(

<div
className={styles.item}
onClick={onClick}
>

<div className={styles.avatar}>

{
user?.photo?

<Image
src={user.photo}
alt={user.name}
width={52}
height={52}
/>

:
<div className={styles.initial}>
{user?.name?.charAt(0).toUpperCase()||"U"}
</div>

}


<span 
className={
isOnline 
? styles.onlineDot 
: styles.offlineDot
}
/>


</div>


<div className={styles.content}>


<div className={styles.top}>


<div>

<h4>
{
user?.name||"User"
}
</h4>


<p className={
isOnline
?
styles.online
:
styles.offline
}>

<span></span>

{
isOnline
?
"Online"
:
"Offline"
}

</p>


</div>



<div className={styles.actions}>


{
chat.unreadCount>0&&(

<span className={styles.badge}>
{chat.unreadCount}
</span>

)
}



<button aria-label="Delete" className={styles.deleteBtn} onClick={(e)=>{e.stopPropagation(); onDelete();}} title="Delete Chat">🗑️</button>

</div>
</div>

<p>{chat.lastMessage?.message || chat.lastMessage || "Start conversation"}</p>


</div>


</div>

);

}