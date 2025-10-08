import connectToDatabase from '../../../lib/mongodb';
import Product from '@/models/Product'; // Make sure this model exists
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid ObjectId format:', id);
    return res.status(400).json({ message: 'Invalid ObjectId format' });
  }

  try {
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected.');

    // Fetch data from products collection
    const product = await Product.findById(id);

    if (!product) {
      console.error('Product not found for id:', id);
      return res.status(404).json({ message: 'Product not found' });
    }

    // Return the fetched product
    return res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching Product:', error);
    return res.status(500).json({ message: 'Failed to fetch Product', error: error.message });
  }
}
