// pages/api/feature.js
import dbConnect from "../../../lib/mongodb";
import Product from "@/models/Product"; // Make sure model path is correct

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ message: "Method Not Allowed" });

  const { productId } = req.body;

  await dbConnect();

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: "Product not found" });

  const now = new Date();
  const featuredUntil = new Date(now.getTime() + 10 * 1000); // 10 seconds later

  product.feature = true;
  product.featuredUntil = featuredUntil;
  await product.save();

  // Schedule it to auto-disable feature after 10 seconds (ideal in cron job / server)
  setTimeout(async () => {
    const prod = await Product.findById(productId);
    if (prod && prod.featuredUntil <= new Date()) {
      prod.feature = false;
      await prod.save();
    }
  }, 10 * 1000);

  return res.status(200).json({ message: "Product featured successfully" });
}