import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  contact: { type: String, required: true, unique: true },  // Mobile or Email
  name: { type: String },
  email: { type: String },
  mobile: { type: String },
  photo: { type: String },
});

export default mongoose.models.User || mongoose.model("User", userSchema);