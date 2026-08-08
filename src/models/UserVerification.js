import mongoose from "mongoose";

const UserVerificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    emailVerified: { type: Boolean, default: false },
    idType: { type: String },
    frontImage: { type: String },
    backImage: { type: String },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    selfieImage: { type: String },
    selfieVerified: { type: Boolean, default: false },
  }, { timestamps: true });  

export default mongoose.models.UserVerification ||
  mongoose.model("UserVerification", UserVerificationSchema);
