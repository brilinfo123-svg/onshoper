import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    messageType: {
      type: String,
      default: "text",
    },

    isSeen: {
      type: Boolean,
      default: false,
    },

    seenAt: {
      type: Date,
      default: null,
    },
    buyerDeleted:{
      type:Boolean,
      default:false
      },
      
      sellerDeleted:{
      type:Boolean,
      default:false
      },
      
      buyerDeletedAt:{
      type:Date,
      default:null
      },
      
      sellerDeletedAt:{
      type:Date,
      default:null
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);