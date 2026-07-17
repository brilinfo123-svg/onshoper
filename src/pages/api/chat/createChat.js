// pages/api/chat/createChat.js
import dbConnect from "../../../lib/mongodb";
import Chat from "@/models/Chat";

export default async function handler(req,res){

if(req.method!=="POST"){
return res.status(405).json({
message:"Method not allowed"
});
}

try{

await dbConnect();

const {
receiverId,
productId,
buyerId
}=req.body;


let chat=await Chat.findOne({
buyer:buyerId,
seller:receiverId,
product:productId
});


if(!chat){

chat=await Chat.create({

buyer:buyerId,
seller:receiverId,
product:productId,
lastMessage:"",
unreadCount:0,
lastMessageSeen:false

});

}


return res.status(200).json({
success:true,
chat
});


}catch(error){

return res.status(500).json({
success:false,
message:error.message
});

}

}