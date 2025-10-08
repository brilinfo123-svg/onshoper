// pages/api/favorites/count.js
import connectToDatabase from "../../../lib/mongodb";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const { db } = await connectToDatabase();
    const count = await db.collection('favourites').countDocuments({ userId });
    
    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
}