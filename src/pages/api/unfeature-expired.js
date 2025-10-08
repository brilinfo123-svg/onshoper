import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  try {
    await connectDB();

    const now = new Date();

    const result = await Product.updateMany(
      {
        feature: true,
        featuredUntil: { $lt: now },
      },
      {
        $set: { feature: false },
        $unset: { featuredUntil: "" },
      }
    );

    res.status(200).json({ message: "Expired features cleared", result });
  } catch (error) {
    console.error("Unfeature error:", error);
    res.status(500).json({ error: "Failed to unfeature products" });
  }
}
