// models/Chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  otherUserId: String,
  otherUserName: String,
  lastMessage: Object,
}, { timestamps: true });

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
