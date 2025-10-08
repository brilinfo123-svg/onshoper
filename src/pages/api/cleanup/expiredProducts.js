
import connectToDatabase from "../../../lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).end();

  await connectToDatabase();

  const result = await Product.deleteMany({
    expiresAt: { $lte: new Date() }
  });

  res.status(200).json({
    success: true,
    deletedCount: result.deletedCount
  });
}
