import { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';

const uri = 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net';
const dbName = 'test';
const collectionName = 'products';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { shopOwnerID } = req.query;

  if (!shopOwnerID || typeof shopOwnerID !== 'string') {
    return res.status(400).json({ error: 'shopOwnerID is required and must be a string' });
  }

  let client;

  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const products = await db
      .collection(collectionName)
      .find({ shopOwnerID }) // match documents with the given shopOwnerID
      .toArray();

    if (!products.length) {
      return res.status(404).json({ message: 'No products found for this shopOwnerID' });
    }

    return res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
