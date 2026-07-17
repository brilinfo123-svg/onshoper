import dbConnect from "../../../lib/mongodb";
import Chat from "@/models/Chat";

export default async function handler(req,res){

if(req.method!=="GET"){
return res.status(405).json({
message:"Method not allowed"
});
}

try{

await dbConnect();

const {userId}=req.query;

const chats=await Chat.find({

$or:[

{

buyer:userId,

buyerDeleted:false

},

{

seller:userId,

sellerDeleted:false

}

]

})
.populate("buyer","name photo isOnline lastSeen")
.populate("seller","name photo isOnline lastSeen")
.populate("product","title images")
.sort({
updatedAt:-1
});

const formattedChats=chats.map(chat=>{

const isBuyer=
chat.buyer._id.toString()===userId;

const otherUser=
isBuyer
?chat.seller
:chat.buyer;

return{

...chat.toObject(),

otherUser,

unreadCount:
isBuyer
?chat.buyerUnreadCount
:chat.sellerUnreadCount

};

});

return res.status(200).json({
success:true,
chats:formattedChats
});

}catch(error){

return res.status(500).json({
success:false,
message:error.message
});

}

}