// pages/api/fetchWishlist.ts
import connectDB from "../../../lib/mongodb";
import Favourite from "../../../models/Favorites";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { userId, shopOwnerID, productId, isFavorited } = req.body;

  try {
    await connectDB();

    if (isFavorited) {
      const exists = await Favourite.findOne({ shopUserID: userId, productId });
      if (exists) return res.status(200).json({ success: true });

      await Favourite.create({ shopUserID: userId, shopOwnerID, productId });
      return res.status(200).json({ success: true });
    } else {
      await Favourite.deleteOne({ shopUserID: userId, productId });
      return res.status(200).json({ success: true });
    }
  } catch (error) {
    console.error("Wishlist API error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}