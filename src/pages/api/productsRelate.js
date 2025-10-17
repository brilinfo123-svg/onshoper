import dbConnect from '@/lib/mongodb';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { category, subcategory } = req.query;

  try {
    const products = await Product.find({
      $or: [
        { category: category },
        { subcategory: subcategory }
      ]
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching related products:", error);
    res.status(500).json({ message: "Server error" });
  }
}