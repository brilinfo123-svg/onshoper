// models/NotificationToken.js
import mongoose from "mongoose";

const NotificationTokenSchema = new mongoose.Schema({
  userId: { type: String },   // 👈 allow string
  contact: { type: String, required: true },
  token: { type: String, required: true },
  device: { type: String, default: "web" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.NotificationToken ||
  mongoose.model("NotificationToken", NotificationTokenSchema);
