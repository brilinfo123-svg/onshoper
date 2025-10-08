// pages/api/products/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test";
const client = new MongoClient(uri);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).json({ message: "Method Not Allowed" });

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("products");

    const products = await collection.find().sort({ createdAt: -1 }).toArray();

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ success: false, message: "Error fetching products" });
  } finally {
    await client.close();
  }
}
