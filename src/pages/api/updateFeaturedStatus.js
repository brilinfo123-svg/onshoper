import clientPromise from '@/lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const client = await clientPromise;
    const db = client.db("test"); // Your database name
    const { shopId, isFeatured } = req.body;

    if (!shopId) {
      return res.status(400).json({ error: "Shop ID is required" });
    }

    // Update shop in database
    await db.collection("localshops").updateOne(
      { _id: shopId },
      { $set: { isFeatured, featuredUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) } } // 60 days from now
    );

    res.status(200).json({ success: true, message: "Shop updated as featured" });
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
