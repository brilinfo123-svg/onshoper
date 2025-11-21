import connectToDatabase from "../../../lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).end(); 
  // 👆 PATCH use karna better hai kyunki hum update kar rahe hain, delete nahi

  await connectToDatabase();

  // ✅ Expired products ko "expired" mark karo instead of deleting
  const result = await Product.updateMany(
    { expiresAt: { $lte: new Date() } },
    { $set: { status: "expired", isActive: false } }
  );

  res.status(200).json({
    success: true,
    message: "Expired products flagged successfully",
    updatedCount: result.modifiedCount
  });
}
