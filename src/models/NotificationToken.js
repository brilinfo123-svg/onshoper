// models/NotificationToken.js
import mongoose from "mongoose";

const NotificationTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  token: { type: String, required: true },
  device: { type: String, default: "web" }, // optional: device type
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.NotificationToken || mongoose.model("NotificationToken", NotificationTokenSchema);
