import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net'; // Your MongoDB connection URI
const DATABASE_NAME = 'test';
const COLLECTION_NAME = 'localshops';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  let client;

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // Find document by ObjectId
    const shop = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    return res.status(200).json(shop);
  } catch (error) {
    console.error('Error fetching shop by ID:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
