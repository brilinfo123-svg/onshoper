import { MongoClient } from 'mongodb';
import { NextApiRequest, NextApiResponse } from 'next';

const MONGO_URI = 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net';
const DATABASE_NAME = 'test';

const LOCALSHOP_COLLECTION = 'localshops';
const REGISTRATIONS_COLLECTION = 'registrations';
const FAVOURITES_COLLECTION = 'favourites';
const USERS_COLLECTION = 'users';
const PRODUCT_COLLECTION = 'products';
const SHOPOWNERS_COLLECTION = 'shopowners';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userEmail } = req.query;

  if (!userEmail || typeof userEmail !== 'string') {
    return res.status(400).json({ error: 'Email is required and must be a string' });
  }

  let client;

  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    const db = client.db(DATABASE_NAME);

    // ✅ Fetch from users collection by contact
    const user = await db.collection(USERS_COLLECTION).findOne({ contact: userEmail });

    // ✅ Fetch shopOwner using shopOwnerID (same as userEmail here)
    const shopOwner = await db.collection(SHOPOWNERS_COLLECTION).findOne({ shopOwnerID: userEmail });

    // ✅ Existing queries
    const localShop = await db.collection(LOCALSHOP_COLLECTION).findOne({ contact: userEmail });
    const registration = await db.collection(REGISTRATIONS_COLLECTION).findOne({ email: userEmail });
    const favourites = await db.collection(FAVOURITES_COLLECTION).find({ myShopEmail: userEmail }).toArray();

    // ✅ Fetch products posted by this user
    const products = await db.collection(PRODUCT_COLLECTION).find({ ownerEmail: userEmail }).toArray();

    const responseData = {
      user: user || null,
      registration: registration || null,
      shop: localShop || null,
      favourites: favourites.length > 0 ? favourites : [],
      shopOwner: shopOwner || null,
      products: products.length > 0 ? products : [], // ✅ Added products
    };

    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Error fetching data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    if (client) {
      await client.close();
    }
  }
};

export default handler;
