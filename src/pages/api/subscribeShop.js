import connectToDatabase from "@/lib/mongodb";
import mongoose from "mongoose";
import Favorites from "../../models/Favorites";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ success: false, error: "Method not allowed" });
  }

  try {
    await connectToDatabase();

    const { userId, productId, isFavorited, shopOwnerID } = req.body;

    // ✅ Validate input
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(shopOwnerID) ||
      !userId ||
      typeof userId !== "string"
    ) {
      return res.status(400).json({ success: false, error: "Invalid inputs" });
    }

    // ✅ Check if favorite already exists
    const existingEntry = await Favorites.findOne({
      myShopEmail: userId,
      productId: productId, // ✅ renamed from shopUserID to productId
    });

    if (isFavorited) {
      if (!existingEntry) {
        const newEntry = new Favorites({
          myShopEmail: userId,
          productId: productId,
          shopOwnerID: shopOwnerID,
        });

        await newEntry.save();
        return res.status(200).json({
          success: true,
          data: newEntry,
          message: "Added to favorites",
        });
      } else {
        return res.status(200).json({
          success: true,
          message: "Already in favorites",
        });
      }
    } else {
      if (existingEntry) {
        await Favorites.deleteOne({ _id: existingEntry._id });
        return res.status(200).json({
          success: true,
          message: "Removed from favorites",
        });
      } else {
        return res.status(404).json({
          success: false,
          message: "Favorite not found",
        });
      }
    }
  } catch (error) {
    console.error("Error processing favorite:", error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
}
