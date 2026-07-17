import { Server } from "socket.io";

import dbConnect from "@/lib/mongodb";
import User from "@/models/User";

export default async function handler(req,res){

if(!res.socket.server.io){

const io=new Server(
res.socket.server,
{
path:"/api/socket",
addTrailingSlash:false,
}
);

res.socket.server.io=io;

io.on(
"connection",
(socket)=>{

console.log(
"User connected:",
socket.id
);


// Join user room
socket.on(
"join",
async(userId)=>{

try{

console.log(
"JOIN REQUEST:",
userId
);

// Save userId on socket
socket.userId=String(userId);

// Join room
socket.join(String(userId));

await dbConnect();

await User.findByIdAndUpdate(
userId,
{
isOnline:true,
emailNotificationSent:false
}
);

io.emit(
"userOnline",
{
userId,
}
);

console.log(
"Online:",
userId
);

}catch(error){

console.log(
"JOIN ERROR:",
error
);

}

}
);



// Send real-time message
socket.on(
"sendMessage",
(data)=>{

io.to(
String(data.receiverId)
).emit(
"receiveMessage",
data
);

io.to(
String(data.senderId)
).emit(
"receiveMessage",
data
);

}
);




// User disconnect
socket.on(
"disconnect",
async(reason)=>{

try{

console.log(
"SOCKET DISCONNECTED:",
socket.id,
reason
);

// Get saved user id
const userId=socket.userId;

console.log(
"DISCONNECT USER:",
userId
);

if(!userId){

console.log(
"USER ID NOT FOUND"
);

return;

}

await dbConnect();

const lastSeen=new Date();

await User.findByIdAndUpdate(
userId,
{
isOnline:false,
lastSeen,
emailNotificationSent:false
}
);

io.emit(
"userOffline",
{
userId,
lastSeen,
}
);

console.log(
"Offline:",
userId
);

}catch(error){

console.log(
"DISCONNECT ERROR:",
error
);

}

}
);

}
);

}

res.end();

}