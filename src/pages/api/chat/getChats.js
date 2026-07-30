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

const formattedChats = chats
  .filter((chat) => chat.buyer && chat.seller)
  .map((chat) => {

    const isBuyer =
      String(chat.buyer?._id) === String(userId);

    const otherUser = isBuyer ? chat.seller : chat.buyer;

    return {
      ...chat.toObject(),
      otherUser,
      unreadCount: isBuyer
        ? (chat.buyerUnreadCount || 0)
        : (chat.sellerUnreadCount || 0),
    };
  });

return res.status(200).json({
success:true,
chats:formattedChats
});

}catch(error){

console.error("❌ GET CHATS ERROR:", error);

return res.status(500).json({
    success:false,
    message:error.message
});

}

}