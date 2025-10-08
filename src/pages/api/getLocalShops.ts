import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const MONGO_URI = 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net'; // Your MongoDB connection URI
const DATABASE_NAME = 'test'; // Your database name
const LOCALSHOP_COLLECTION = 'localshops'; // Your collection name

const handler = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let client;

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Fetch all documents from the "localshops" collection
    const localShops = await db.collection(LOCALSHOP_COLLECTION).find().toArray();

    return res.status(200).json(localShops);
  } catch (error) {
    console.error('Error fetching local shops:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

export default handler;
