"use client";

import styles from "./index.module.scss";

export default function MessageBubble({
message,
isOwn,
isLastOwnMessage
}){

const getSeenTime=()=>{

if(!message.seenAt)return"Just now";

const now=new Date();
const seen=new Date(message.seenAt);

const diff=Math.floor((now.getTime()-seen.getTime())/1000);

if(diff<60){
return"Just now";
}

const minutes=Math.floor(diff/60);

if(minutes<60){
return`${minutes} min${minutes>1?"s":""} ago`;
}

const hours=Math.floor(minutes/60);

if(hours<24){
return`${hours} hour${hours>1?"s":""} ago`;
}

const days=Math.floor(hours/24);

if(days<7){
return`${days} day${days>1?"s":""} ago`;
}

const weeks=Math.floor(days/7);

if(weeks<4){
return`${weeks} week${weeks>1?"s":""} ago`;
}

const months=Math.floor(days/30);

if(months<12){
return`${months} month${months>1?"s":""} ago`;
}

const years=Math.floor(days/365);

return`${years} year${years>1?"s":""} ago`;

};

return(

<div className={`${styles.wrapper} ${isOwn ? styles.right : styles.left}`}>

<div className={styles.messageContainer}>

<div className={styles.bubble}>

<p>{message.message}</p>

<div className={styles.meta}>

<span>
{new Date(message.createdAt).toLocaleTimeString([],{
hour:"2-digit",
minute:"2-digit"
})}
</span>

</div>

</div>

{isOwn&&isLastOwnMessage&&(
<div className={styles.status}>
{
message.isSeen
?
<>
<span className={styles.eye}>👁</span>
<span>Seen {getSeenTime()}</span>
</>
:
<span>Delivered</span>
}
</div>
)}

</div>

</div>

);

}