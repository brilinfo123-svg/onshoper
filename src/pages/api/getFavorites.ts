import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect(); // Ensure database connection

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { userId } = req.query;
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Valid User ID is required' });
  }

  try {
    const objectIdUser = new mongoose.Types.ObjectId(userId); // Convert userId to ObjectId

    const favoriteShops = await mongoose.connection.db
      .collection('favourites')
      .aggregate([
        {
          $match: { myShopUserID: objectIdUser } // Match the user's favorite shops
        },
        {
          $lookup: {
            from: 'localshops', // Join with the localshops collection
            localField: 'shopUserID',
            foreignField: '_id',
            as: 'shopDetails'
          }
        },
        { $unwind: '$shopDetails' }, // Unwind to get shop details as an object
        {
          $project: {
            _id: 0, // Exclude favorites collection _id
            shopId: '$shopDetails._id',
            businessName: '$shopDetails.businessName',
            fullName: '$shopDetails.fullName',
            profileImage: '$shopDetails.profileImage',
            category: '$shopDetails.category',
            featured: '$shopDetails.featured',
            email: '$shopDetails.email',
            userEmail: '$shopDetails.userEmail',
            isFavorite: true // ✅ Explicitly mark as favorite
          }
        }
      ])
      .toArray();

    return res.status(200).json(favoriteShops);
  } catch (error) {
    console.error('Error fetching favorite shops:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
