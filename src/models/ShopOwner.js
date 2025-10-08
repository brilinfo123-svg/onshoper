import mongoose from "mongoose";

const shopOwnerSchema = new mongoose.Schema({
  shopOwnerID: { type: String, unique: true, required: true },

  hasPaid: { type: Boolean, default: false },

  paidUntil: { type: Date, default: null }, // Optional: for subscription expiry

  paymentMethod: { type: String, default: "" }, // e.g. "Razorpay", "Stripe", "UPI"

  planType: { type: String, default: "Free" }, // e.g. "Free", "Basic", "Premium"
  paidCategories: { type: [String], default: [] }, // ✅ New field
  paymentHistory: [
    {
      category: String,
      amount: Number,
      date: Date,
      transactionId: String,
      method: String,
    }
  ],

  createdAt: { type: Date, default: Date.now },
});


const ShopOwner = mongoose.models.ShopOwner || mongoose.model("ShopOwner", shopOwnerSchema);

export default ShopOwner;