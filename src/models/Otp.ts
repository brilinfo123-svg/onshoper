import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // TTL: delete 60 seconds after this time
  },
});

export default mongoose.models.Otp || mongoose.model("Otp", otpSchema);
