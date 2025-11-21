import dbConnect from "../../../lib/mongodb";
import ShopOwner from "@/models/ShopOwner";
import Product from "@/models/Product";

export default async function handler(req, res) {
  await dbConnect();

  const { contact } = req.query; // 👈 use contact instead of shopOwnerID

  if (!contact) {
    return res.status(400).json({ success: false, message: "Missing contact" });
  }

  try {
    // ✅ Find ShopOwner by contact
    const shopOwner = await ShopOwner.findOne({ contact }).select(
      "_id contact paidUntil createdAt paymentHistory hasPaid planType paidCategories"
    );

    if (!shopOwner) {
      return res.status(404).json({ success: false, message: "ShopOwner not found" });
    }

    // ✅ Fetch products by contact
    const products = await Product.find({ contact }).lean();

    return res.status(200).json({
      success: true,
      shopOwner,
      products,
    });
  } catch (err) {
    console.error("Error fetching shopOwner + products:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
