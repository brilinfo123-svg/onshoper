// ✅ File: /pages/api/favourites/isFavourite.ts
import connectDB from "../../../lib/mongodb";
import Favourite from "@/models/Favorites";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end();
  
    const { userId, productId } = req.body;
  
    try {
      await connectDB();
      const isFavourite = await Favourite.findOne({ shopUserID: userId, productId });
      res.status(200).json({ isFavourite: !!isFavourite });
    } catch (err) {
      res.status(500).json({ error: "Server error" });
    }
  }