import dbConnect from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

export default async function handler(req,res){

if(req.method!=="PUT"){
return res.status(405).json({
success:false
});
}


try{


await dbConnect();


const {
chatId,
userId
}=req.body;



const chat=await Chat.findById(chatId);


if(!chat){

return res.status(404).json({

success:false,

message:"Chat not found"

});

}



const seenTime=new Date();



await Message.updateMany(

{
chatId,
receiverId:userId,
isSeen:false
},

{
$set:{
isSeen:true,
seenAt:seenTime
}
}

);





if(chat.buyer.toString()===String(userId)){

chat.buyerUnreadCount=0;

}else{

chat.sellerUnreadCount=0;

}



chat.lastMessageSeen=true;


await chat.save();





// SOCKET EMIT

const io=res.socket?.server?.io;


if(io){


const senderId=

chat.buyer.toString()===String(userId)

?

chat.seller.toString()

:

chat.buyer.toString();



io.to(senderId).emit(
"messagesSeen",
{

chatId:String(chatId),

seenAt:seenTime

}
);



console.log(
"👁 SEEN EVENT SENT:",
senderId
);



}else{


console.log(
"❌ SOCKET NOT FOUND"
);


}




return res.status(200).json({

success:true,

seenAt:seenTime

});



}catch(error){


console.log(
"MARK SEEN ERROR",
error
);



return res.status(500).json({

success:false,

message:error.message

});


}

}