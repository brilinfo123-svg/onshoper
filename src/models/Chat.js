import mongoose from "mongoose";


const ChatSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageSender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    buyerUnreadCount: {
      type: Number,
      default: 0,
    },

    sellerUnreadCount: {
      type: Number,
      default: 0,
    },

    buyerDeleted: {
      type: Boolean,
      default: false,
    },

    sellerDeleted: {
      type: Boolean,
      default: false,
    },

    lastMessageSeen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.Chat ||
  mongoose.model("Chat", ChatSchema);