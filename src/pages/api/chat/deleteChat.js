import dbConnect from "../../../lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export default async function handler(req,res){

if(req.method!=="DELETE"){

return res.status(405).json({
success:false,
message:"Method not allowed"
});

}

try{

await dbConnect();

const {
chatId,
userId
}=req.body;


if(!chatId || !userId){

return res.status(400).json({
success:false,
message:"ChatId and UserId required"
});

}


// find chat

const chat=await Chat.findById(chatId);


if(!chat){

return res.status(404).json({
success:false,
message:"Chat not found"
});

}


// check user

const isBuyer =
chat.buyer.toString() === userId;


const isSeller =
chat.seller.toString() === userId;



if(!isBuyer && !isSeller){

return res.status(403).json({
success:false,
message:"You are not part of this chat"
});

}



// buyer delete

if(isBuyer){

chat.buyerDeleted=true;


await Message.updateMany(

{
chatId
},

{
$set:{
buyerDeleted:true,
buyerDeletedAt:new Date()
}
}

);

}



// seller delete

if(isSeller){

chat.sellerDeleted=true;


await Message.updateMany(

{
chatId
},

{
$set:{
sellerDeleted:true,
sellerDeletedAt:new Date()
}
}

);

}



// both users deleted

if(
chat.buyerDeleted &&
chat.sellerDeleted
){


await Message.deleteMany({
chatId
});


await Chat.findByIdAndDelete(chatId);



return res.status(200).json({

success:true,

deleted:true,

message:"Chat permanently deleted"

});

}



// only current user deleted

await chat.save();



return res.status(200).json({

success:true,

deleted:false,

message:"Chat removed for you"

});



}catch(error){

console.log(error);


return res.status(500).json({

success:false,

message:error.message

});

}

}