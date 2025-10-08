import connectDB from "../../../lib/mongodb";
import Product from "../../../models/Product";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await connectDB();
  const { productId } = req.body;

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ error: "Not found" });

  const now = new Date();

  const updated = await Product.findByIdAndUpdate(
    productId,
    product.isFeatured
      ? { isFeatured: false, featuredUntil: null }
      : {
          isFeatured: true,
          featuredUntil: new Date(now.getTime() + 60 * 60 * 1000), // +1 hour
        },
    { new: true }
  );

  return res.status(200).json({
    success: true,
    isFeatured: updated.isFeatured,
    featuredUntil: updated.featuredUntil,
  });
}
