// /pages/api/favorites/fetchFavoritesByShopOwner.js
import connectDB from "../../../lib/mongodb";
import Favourite from "../../../models/Favorites";
import Product from "../../../models/Product"; // assuming you have this model

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "Missing userId" });
  }

  try {
    await connectDB();

    const favorites = await Favourite.find({ shopUserID: userId });

    const productIds = favorites.map((fav) => fav.productId);

    const products = await Product.find({ _id: { $in: productIds } });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
