import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    contact: {
      type: String,
      required: true,
      unique: true,
    },

    name: {
      type: String,
    },

    email: {
      type: String,
    },

    mobile: {
      type: String,
    },

    photo: {
      type: String,
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastSeen: {
      type: Date,
      default: null,
    },
    lastEmailSentAt:{
      type:Date,
      default:null
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.models.User || mongoose.model("User", userSchema);