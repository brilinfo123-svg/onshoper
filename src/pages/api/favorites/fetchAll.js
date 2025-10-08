import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  await connectDB();

  // 🛠️ Auto-remove expired featured status
  await Product.updateMany(
    { isFeatured: true, featuredUntil: { $lte: new Date() } },
    { $set: { isFeatured: false, featuredUntil: null } }
  );

  const products = await Product.find().sort({ createdAt: -1 });
  res.status(200).json(products);
}
