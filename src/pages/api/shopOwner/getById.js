// pages/api/shopOwner/getById.js
import dbConnect from "../../../lib/mongodb";
import ShopOwner from "@/models/ShopOwner";

export default async function handler(req, res) {
  await dbConnect();

  const { shopOwnerID } = req.query;   // 👈 frontend se ye aa raha hai
  if (!shopOwnerID) {
    return res.status(400).json({ success: false, message: "Missing shopOwnerID" });
  }

  try {
    const shopOwner = await ShopOwner.findOne({ shopOwnerID }) // 👈 search by shopOwnerID field
      .select("paidUntil createdAt paymentHistory hasPaid planType paidCategories");

    if (!shopOwner) {
      return res.status(404).json({ success: false, message: "ShopOwner not found" });
    }

    return res.json({ success: true, shopOwner });
  } catch (err) {
    console.error("Error fetching shopOwner:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
