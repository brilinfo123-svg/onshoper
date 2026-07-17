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



useEffect(()=>{

if(!socket || !session?.user?.id) return;


socket.emit(
"join",
session.user.id
);



const handleReceiveMessage=(message)=>{

fetchChats();
console.log(
"NEW MESSAGE RECEIVED",
message
);


if(!activeChat) return;


if(message.chatId!==activeChat._id){
return;
}



setMessages(prev=>{


const alreadyExist=prev.some(
item=>item._id===message._id
);


if(alreadyExist){
return prev;
}


return[
...prev,
message
];


});



// mark message seen instantly

// mark message seen instantly

fetch("/api/chat/markSeen",{

    method:"PUT",
    
    headers:{
    "Content-Type":"application/json"
    },
    
    body:JSON.stringify({
    
    chatId:message.chatId,
    
    userId:session.user.id
    
    })
    
    }).catch(error=>{
    
    console.log(error);
    
    });


};





const handleMessagesSeen=({chatId})=>{


    console.log(
    "MESSAGES SEEN EVENT:",
    chatId
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
    
    isSeen:true
    
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


},[socket,session,activeChat]);





useEffect(()=>{


if(!router.isReady)return;


const {chatId}=router.query;


if(!chatId)return;



const loadChat=async()=>{


try{


const res=await fetch(
`/api/chat/getChats?userId=${session?.user?.id}`
);


const data=await res.json();



if(!data.success)return;



const chat=data.chats.find(
item=>item._id===chatId
);



if(chat){

setActiveChat(chat);

}


}catch(error){

console.log(error);

}


};



if(session?.user?.id){

loadChat();

}



},[
router.isReady,
router.query.chatId,
session
]);



const fetchChats=async()=>{

    if(!session?.user?.id)return;
    
    try{
    
    const res=await fetch(`/api/chat/getChats?userId=${session.user.id}`);
    
    const data=await res.json();
    
    if(data.success){
    
    setChats(data.chats);
    
    const total=data.chats.reduce(
    (sum,chat)=>sum+(chat.unreadCount||0),
    0
    );
    
    setTotalUnread(total);
    
    }
    
    }catch(error){
    
    console.log(error);
    
    }
    
    };

    useEffect(()=>{

        if(session?.user?.id){
        
        fetchChats();
        
        }
        
        },[session?.user?.id]);

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



if(!response.ok){

console.log(data);

return;

}



setActiveChat(data.chat);


await fetchChats();
router.push(
`/chat?chatId=${data.chat._id}`
);



}catch(error){

console.log(error);

}


};







const openChat=async(chat)=>{


setActiveChat(chat);



try{


await fetch(
"/api/chat/markSeen",
{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

chatId:chat._id,

userId:session.user.id

})

}

);
await fetchChats();


}catch(error){

console.log(error);

}



};







const closeChat=()=>{


setActiveChat(null);

setMessages([]);


};







const addMessage=(message)=>{


setMessages(prev=>[

...prev,

message

]);


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