// models/favourite.ts
import mongoose, { Schema, Document, models, model } from "mongoose";

// 1️⃣ Interface for TypeScript type checking
export interface IFavourite extends Document {
  shopUserID: string;
  shopOwnerID: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
}
 
// 2️⃣ Schema
const favouriteSchema = new Schema<IFavourite>(
  {
    shopUserID: { type: String, required: true },
    shopOwnerID: { type: Schema.Types.ObjectId, ref: "User" },
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  },
  { timestamps: true }
);

// 3️⃣ Export with typing support
export default models.Favourite || model<IFavourite>("Favourite", favouriteSchema);
 