import connectToDatabase from '../../../lib/mongodb';
import Product from '@/models/Product'; // <-- Update to your actual Product model path

export default async function handler(req, res) {
  try {
    await connectToDatabase();

    // Get query params from URL
    const { category, subcategory } = req.query;

    // Build filter object
    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (subcategory) {
      filter.subcategory = subcategory;
    }

    // Fetch products with optional filtering
    const products = await Product.find(filter);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
}
