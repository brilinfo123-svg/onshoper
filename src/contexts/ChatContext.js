"use client";

import {createContext,useContext,useState,useEffect} from "react";
import {useSession} from "next-auth/react";
import {useSocket} from "@/contexts/SocketContext";
import {useRouter} from "next/router";


const ChatContext=createContext();



export function ChatProvider({children}){


const {data:session}=useSession();

const {socket}=useSocket();

const router=useRouter();



const [activeChat,setActiveChat]=useState(null);

const [messages,setMessages]=useState([]);

const [chats,setChats]=useState([]);

const [totalUnread,setTotalUnread]=useState(0);




// ===============================
// UPDATE TOTAL UNREAD
// ===============================

const updateUnreadCount=(chatList)=>{


const total=chatList.reduce(

(sum,chat)=>
sum+(chat.unreadCount || 0),

0

);


setTotalUnread(total);


};





// ===============================
// SOCKET MESSAGE HANDLING
// ===============================


useEffect(()=>{


if(!socket || !session?.user?.id)
return;



socket.emit(
"join",
session.user.id
);



const handleReceiveMessage=(message)=>{


console.log(
"📩 NEW MESSAGE RECEIVED",
message
);



// UPDATE SIDEBAR CHAT REALTIME

setChats(prev=>{


let chatExists=false;



const updated=prev.map(chat=>{


if(
String(chat._id)!==
String(message.chatId)
){

return chat;

}



chatExists=true;



return{


...chat,


lastMessage:message,


updatedAt:message.createdAt,



unreadCount:

activeChat?._id===message.chatId

?

0

:

(chat.unreadCount || 0)+1



};


});




// if new chat then reload

if(!chatExists){

fetchChats();

return prev;

}



// sort latest message top

updated.sort((a,b)=>

new Date(b.updatedAt).getTime()
-
new Date(a.updatedAt).getTime()

);



updateUnreadCount(updated);



return updated;


});




// if chat open

if(

activeChat &&
String(message.chatId)===String(activeChat._id)

){


setMessages(prev=>{


const exists=prev.some(

item=>item._id===message._id

);


if(exists)
return prev;



return[
...prev,
message
];


});



// mark seen

fetch("/api/chat/markSeen",{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

chatId:message.chatId,

userId:session.user.id

})

}).catch(console.log);



}



};





// ===============================
// SEEN EVENT
// ===============================


const handleMessagesSeen=({
chatId,
seenAt

})=>{


console.log(
"👁 REALTIME SEEN",
chatId,
seenAt
);



setMessages(prev=>

prev.map(msg=>{


if(

String(msg.chatId)===String(chatId)

&&

String(msg.senderId)===String(session.user.id)

){


return{

...msg,

isSeen:true,

seenAt:seenAt || new Date()

};


}


return msg;


})

);


};





socket.on(
"receiveMessage",
handleReceiveMessage
);


socket.on(
"messagesSeen",
handleMessagesSeen
);





return()=>{


socket.off(
"receiveMessage",
handleReceiveMessage
);


socket.off(
"messagesSeen",
handleMessagesSeen
);


};



},[
socket,
session,
activeChat
]);







// ===============================
// LOAD CHAT FROM URL
// ===============================


useEffect(()=>{


if(!router.isReady)
return;


const {chatId}=router.query;


if(!chatId)
return;



const loadChat=async()=>{


try{


const res=await fetch(

`/api/chat/getChats?userId=${session?.user?.id}`

);


const data=await res.json();



if(!data.success)
return;



const chat=data.chats.find(

item=>item._id===chatId

);



if(chat)
setActiveChat(chat);



}catch(error){

console.log(error);

}


};



if(session?.user?.id)
loadChat();



},[
router.isReady,
router.query.chatId,
session
]);








// ===============================
// FETCH CHATS
// ===============================


const fetchChats=async()=>{


if(!session?.user?.id)
return;



try{


const res=await fetch(

`/api/chat/getChats?userId=${session.user.id}`

);



const data=await res.json();



if(data.success){


setChats(data.chats);


updateUnreadCount(data.chats);


}



}catch(error){

console.log(error);

}


};





useEffect(()=>{


if(session?.user?.id)
fetchChats();



},[
session?.user?.id
]);








// ===============================
// START CHAT
// ===============================


const startChat=async(user,product)=>{


try{


const response=await fetch(

"/api/chat/createChat",

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

credentials:"include",

body:JSON.stringify({

receiverId:user.id,

productId:product.id,

buyerId:session.user.id

})

}

);



const data=await response.json();



if(!response.ok)
return;



setActiveChat(data.chat);


await fetchChats();


router.push(

`/chat?chatId=${data.chat._id}`

);



}catch(error){

console.log(error);

}


};








// ===============================
// OPEN CHAT
// ===============================


const openChat=async(chat)=>{


setActiveChat(chat);



try{


await fetch("/api/chat/markSeen",{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

chatId:chat._id,

userId:session.user.id

})

});



setChats(prev=>{


const updated=prev.map(item=>{


if(item._id===chat._id){

return{

...item,

unreadCount:0

};


}


return item;


});



updateUnreadCount(updated);


return updated;


});



}catch(error){

console.log(error);

}


};








const closeChat=()=>{


setActiveChat(null);

setMessages([]);

};






const addMessage=(message)=>{


setMessages(prev=>{


const exists=prev.some(

item=>item._id===message._id

);


if(exists)
return prev;



return[
...prev,
message
];


});


};







return(

<ChatContext.Provider

value={{

activeChat,

messages,

chats,

totalUnread,

fetchChats,

startChat,

openChat,

closeChat,

addMessage,

setMessages,

socket

}}

>


{children}


</ChatContext.Provider>


);


}



export const useChat=()=>useContext(ChatContext);