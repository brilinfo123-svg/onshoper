import dbConnect from "../../../lib/mongodb";
import Favourites from "@/models/Favorites";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userEmail } = req.query;

  if (!userEmail) {
    return res.status(400).json({ error: "Missing userEmail" });
  }

  try {
    const wishlist = await Favourites.find({ myShopEmail: userEmail }).select("shopUserID");
    const productIds = wishlist.map((item) => item.shopUserID);
    return res.status(200).json({ success: true, productIds });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
