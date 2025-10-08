import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { shopOwnerID } = req.body;

  if (!shopOwnerID) return res.status(400).json({ message: "shopOwnerID required" });

  try {
    await client.connect();
    const db = client.db("test");
    const shopOwnersCollection = db.collection("shopowners");

    await shopOwnersCollection.updateOne(
      { shopOwnerID },
      { $set: { hasPaid: true, paidUntil: new Date(Date.now() + 30*24*60*60*1000) } }, // 30 days from now
      { upsert: true }
    );

    res.status(200).json({ success: true, message: "Payment status updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update payment status" });
  } finally {
    await client.close();
  }
}