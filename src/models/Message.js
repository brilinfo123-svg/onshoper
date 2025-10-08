import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  sender: { type: String, required: true },        // sender user ID
  senderName: { type: String, default: null },     // optional sender name
  receiver: { type: String, required: true },      // receiver user ID
  message: { type: String, required: true },       // chat text
  productId: { type: String },
  productTitle: { type: String },
  coverImage: { type: String, default: null },
  otherUserName: { type: String, default: null },
  hiddenForSender: { type: Boolean, default: false },
  hiddenForReceiver: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Message || mongoose.model("Message", MessageSchema);