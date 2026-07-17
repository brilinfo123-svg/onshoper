// pages/api/chat/getMessages.js
import dbConnect from "../../../lib/mongodb";
import Message from "@/models/Message";

export default async function handler(req,res){
if(req.method!=="GET"){
return res.status(405).json({message:"Method not allowed"});
}

try{
await dbConnect();

const {chatId}=req.query;

const messages=await Message.find({
chatId
}).sort({
createdAt:1
});

return res.status(200).json({
success:true,
messages
});

}catch(error){
return res.status(500).json({
success:false,
message:error.message
});
}
}