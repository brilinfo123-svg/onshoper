import dbConnect from '@/lib/mongodb';
import Product from '../../models/Product';

export default async function handler(req, res) {
  await dbConnect();

  const { category, subcategory, city, state } = req.query;

  try {
    const filters = [];

    // ✅ Match either category or subcategory
    if (category || subcategory) {
      filters.push({
        $or: [
          category ? { category } : null,
          subcategory ? { subcategory } : null
        ].filter(Boolean)
      });
    }

    // ✅ Add state filter if provided and not "All States"
    if (state && state !== "All States") {
      filters.push({ "location.state": state });
    }

    // ✅ Add city filter if provided and not "All Cities"
    if (city && city !== "All Cities") {
      filters.push({ "location.city": city });
    }

    const query = filters.length ? { $and: filters } : {};

    const products = await Product.find(query);

    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching related products:", error);
    res.status(500).json({ message: "Server error" });
  }
}
