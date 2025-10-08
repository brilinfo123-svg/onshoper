import mongoose from "mongoose";

const userProfileSchema = new mongoose.Schema({
  contact: { type: String, required: true, unique: true }, // Phone or Email
  name: { type: String },
  location: { type: String },
  photo: { type: String },
});

export default mongoose.models.UserProfile || mongoose.model("UserProfile", userProfileSchema);