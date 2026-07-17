import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  } from "react";
  
  import {io,Socket} from "socket.io-client";
  import {useSession} from "next-auth/react";
  
  interface SocketContextType{
  socket:Socket|null;
  isConnected:boolean;
  onlineUsers:string[];
  }
  
  const SocketContext=createContext<SocketContextType>({
  socket:null,
  isConnected:false,
  onlineUsers:[],
  });
  
  export const useSocket=()=>useContext(SocketContext);
  
  export const SocketProvider=({
  children,
  }:{
  children:ReactNode;
  })=>{
  
  const [socket,setSocket]=useState<Socket|null>(null);
  
  const [isConnected,setIsConnected]=useState(false);
  
  const [onlineUsers,setOnlineUsers]=useState<string[]>([]);
  
  const {data:session}=useSession();
  
  useEffect(()=>{
  
  if(!session?.user?.id){
  return;
  }
  
  let socketInstance:Socket;
  
  const initSocket=async()=>{
  
  if(process.env.NODE_ENV==="development"){
  
  await fetch("/api/socket");
  
  socketInstance=io({
  path:"/api/socket",
  transports:["websocket"],
  });
  
  }else{
  
  socketInstance=io(
  process.env.NEXT_PUBLIC_SOCKET_URL!,
  {
  path:"/socket.io",
  transports:["websocket"],
  }
  );
  
  }
  
  setSocket(socketInstance);
  
  socketInstance.on(
  "connect",
  ()=>{
  
  setIsConnected(true);
  
  console.log(
  "✅ Socket connected:",
  socketInstance.id
  );
  
  socketInstance.emit(
  "join",
  session.user.id
  );
  
  console.log(
  "🚀 JOIN EVENT SENT:",
  session.user.id
  );
  
  }
  );
  
  socketInstance.on(
  "userOnline",
  (data)=>{
  
  console.log(
  "🟢 USER ONLINE:",
  data.userId
  );
  
  setOnlineUsers((prev)=>{
  
  const exists=prev.includes(
  String(data.userId)
  );
  
  if(exists){
  return prev;
  }
  
  return[
  ...prev,
  String(data.userId),
  ];
  
  });
  
  }
  );
  
  socketInstance.on(
  "userOffline",
  (data)=>{
  
  console.log(
  "🔴 USER OFFLINE:",
  data.userId
  );
  
  setOnlineUsers((prev)=>
  prev.filter(
  (id)=>
  id!==String(data.userId)
  )
  );
  
  }
  );
  
  socketInstance.on(
  "disconnect",
  (reason)=>{
  
  console.log(
  "❌ Socket disconnected:",
  reason
  );
  
  setIsConnected(false);
  
  }
  );
  
  };
  
  initSocket();
  
  return()=>{
  
  console.log(
  "🧹 Disconnecting socket..."
  );
  
  socketInstance?.disconnect();
  
  };
  
  },[session?.user?.id]);
  
  return(
  
  <SocketContext.Provider
  value={{
  socket,
  isConnected,
  onlineUsers,
  }}
  >
  
  {children}
  
  </SocketContext.Provider>
  
  );
  
  };