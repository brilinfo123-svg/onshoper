import connectToDatabase from '../../../lib/mongodb';
import LocalShop from '@/models/FormModel';
import mongoose from 'mongoose';

export default async function handler(req, res) {
  const { id } = req.query;

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(id)) {
    console.error('Invalid ObjectId format:', id);  // Log invalid ObjectId
    return res.status(400).json({ message: 'Invalid ObjectId format' });
  }

  try {
    // Connect to database
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected.');

    // Fetch data from LocalShop collection
    const localShop = await LocalShop.findById(id);

    if (!localShop) {
      console.error('LocalShop not found for id:', id);  // Log if not found
      return res.status(404).json({ message: 'LocalShop not found' });
    }

    // Return the fetched data
    return res.status(200).json(localShop);
  } catch (error) {
    console.error('Error fetching LocalShop:', error);  // Log the error
    return res.status(500).json({ message: 'Failed to fetch LocalShop', error: error.message });
  }
}
