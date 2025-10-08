import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  comment: { type: String, required: true },
  rating: { type: Number, required: true },
  ShopKeeperID: { type: String, required: true },  // Ensure it's a string
  VisitedUserShopID: { type: String, required: true } // Ensure it's a string
});

export default mongoose.models.Review || mongoose.model("Review", ReviewSchema);
