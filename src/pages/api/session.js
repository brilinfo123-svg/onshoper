import { MongoClient } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // MongoDB logic here, only on the server side
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const sessions = await db.collection('sessions').find().toArray();
    res.status(200).json(sessions);
  }
}
