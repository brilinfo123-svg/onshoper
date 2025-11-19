import dbConnect from "../../../lib/mongodb";
import ShopOwner from "@/models/ShopOwner";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const { shopOwnerID } = req.query;

  if (!shopOwnerID) {
    return res.status(400).json({ success: false, message: "Missing shopOwnerID" });
  }

  try {
    const shopOwner = await ShopOwner.findOne({ shopOwnerID }).select(
      "_id shopOwnerID paidUntil createdAt paymentHistory hasPaid planType paidCategories"
    );

    if (!shopOwner) {
      return res.status(404).json({ success: false, message: "ShopOwner not found" });
    }

    const products = await Product.find({ shopOwnerID }).lean();

    return res.status(200).json({
      success: true,
      shopOwner,
      products
    });
  } catch (err) {
    console.error("Error fetching shopOwner + products:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
