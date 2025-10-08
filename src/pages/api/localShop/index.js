import connectToDatabase from '../../../lib/mongodb';
import LocalShop from '@/models/FormModel';

export default async function handler(req, res) {
  try {
    // Connect to database
    await connectToDatabase();

    // Fetch all data from the localShop collection
    const localShops = await LocalShop.find();

    // Return the fetched data
    res.status(200).json({ success: true, data: localShops });
  } catch (error) {
    console.error('Error fetching localShops:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch localShops',
      error: error.message,
    });
  }
}
