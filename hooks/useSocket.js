// hooks/useSocket.js
"use client";

import {useEffect,useState} from "react";
import {io} from "socket.io-client";

let socket;

export default function useSocket(userId){
const [connected,setConnected]=useState(false);

useEffect(()=>{
if(!userId)return;

socket=io({
path:"/api/socket",
addTrailingSlash:false
});

socket.on("connect",()=>{
console.log("Socket connected:",socket.id);
setConnected(true);
socket.emit("join",userId);
});

socket.on("disconnect",()=>{
console.log("Socket disconnected");
setConnected(false);
});

return()=>{
socket.disconnect();
};

},[userId]);

return {socket,connected};
}