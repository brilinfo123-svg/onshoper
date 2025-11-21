import mongoose from "mongoose";

const shopOwnerSchema = new mongoose.Schema({
  shopOwnerID: { type: String, unique: true, required: false }, // optional now
  contact: { type: String, unique: true, required: true },      // 👈 new field

  hasPaid: { type: Boolean, default: false },
  paidUntil: { type: Date, default: null },
  paymentMethod: { type: String, default: "" },
  planType: { type: String, default: "Free" },
  paidCategories: { type: [String], default: [] },

  paymentHistory: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true },
      createdAt: { type: Date, default: Date.now },
      expiryAt: { type: Date, required: true },
      transactionId: { type: String, required: true },
      method: { type: String, required: true },
      contact: { type: String }, // 👈 optional tracking
    }
  ],

  createdAt: { type: Date, default: Date.now },
});

const ShopOwner = mongoose.models.ShopOwner || mongoose.model("ShopOwner", shopOwnerSchema);

export default ShopOwner;
