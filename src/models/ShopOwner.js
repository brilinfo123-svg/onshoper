import mongoose from "mongoose";

const shopOwnerSchema = new mongoose.Schema({
  shopOwnerID: { type: String, unique: true, required: true },

  hasPaid: { type: Boolean, default: false },

  // Global expiry (optional, if you want overall subscription expiry)
  paidUntil: { type: Date, default: null },

  paymentMethod: { type: String, default: "" }, // e.g. "Razorpay", "Stripe", "UPI"

  planType: { type: String, default: "Free" }, // e.g. "Free", "Basic", "Premium"

  // Categories for which user has paid
  paidCategories: { type: [String], default: [] },

  // Payment history with validity per category
  paymentHistory: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now }, // when payment was made
      expiryAt: { type: Date, required: true },     // 2 months validity
      transactionId: { type: String, required: true },
      method: { type: String, required: true },
    }
  ],

  createdAt: { type: Date, default: Date.now }, // shopOwner account creation
});

const ShopOwner = mongoose.models.ShopOwner || mongoose.model("ShopOwner", shopOwnerSchema);

export default ShopOwner;
