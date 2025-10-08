import connectToDatabase from "@/lib/mongodb";
import Product from "../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await connectToDatabase();

    const { shopOwnerID, productId, durationInSeconds = 10 } = req.body;

    if (!shopOwnerID || !productId) {
      return res.status(400).json({ message: "❌ shopOwnerID and productId are required" });
    }

    const expirationTime = new Date(Date.now() + durationInSeconds * 1000);

    const result = await Product.findOneAndUpdate(
      { _id: productId, shopOwnerID },
      {
        $set: {
          featured: true,
          featuredUntil: expirationTime,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ message: "❌ Product not found or unauthorized" });
    }

    console.log("✅ Product marked as featured:", result);

    setTimeout(async () => {
      try {
        const reverted = await Product.findOneAndUpdate(
          { _id: productId },
          { $set: { featured: false } },
          { new: true }
        );
        console.log("⏳ Featured status reverted:", reverted);
      } catch (error) {
        console.error("🔥 Error reverting featured status:", error);
      }
    }, durationInSeconds * 1000);

    return res.status(200).json({
      success: true,
      message: `✅ Product marked as featured for ${durationInSeconds} seconds`,
      updatedProduct: result,
    });
  } catch (error) {
    console.error("🔥 Server error:", error);
    return res.status(500).json({ message: "❌ Internal Server Error", error: error.message });
  }
}
