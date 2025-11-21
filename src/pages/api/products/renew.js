import connectToDatabase from "../../../lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  await connectToDatabase();

  const { productId, newExpiryDate } = req.body;

  try {
    const result = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          status: "active",
          isActive: true,
          expiresAt: new Date(newExpiryDate),
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product renewed successfully",
      product: result,
    });
  } catch (error) {
    console.error("Renew error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
