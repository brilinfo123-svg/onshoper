import mongoose from "mongoose";

const RegistrationSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String }, // Store image URL
    otp: { type: String }, // OTP storage
    userId: { type: String, required: true, unique: true }, // Changed from shopId to userId
  },
  { timestamps: true }
);

export default mongoose.models.Registration || mongoose.model("Registration", RegistrationSchema);
