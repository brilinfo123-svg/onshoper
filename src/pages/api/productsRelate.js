import dbConnect from '@/lib/mongodb';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const normalize = (str) => {
    if (!str) return '';
    return decodeURIComponent(str).trim();
  };

  const rawCategory = req.query.category;
  const rawSubcategory = req.query.subcategory;

  const category = normalize(rawCategory);
  const subcategory = normalize(rawSubcategory);

  console.log("🔍 Incoming query:", { category, subcategory });

  try {
    const products = await Product.find({
      category: category,
      subcategory: subcategory
    });

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
}
