import { MongoClient, ObjectId } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    await client.connect();
    const db = client.db("test"); // ✅ replace with your DB name
    const { id } = req.query;

    // 1️⃣ Delete product
    const productResult = await db.collection("products").deleteOne({ _id: new ObjectId(id) });

    if (productResult.deletedCount === 1) {
      // 2️⃣ Delete related reports
      const reportResult = await db.collection("reports").deleteMany({ productId: id });

      res.status(200).json({
        message: "Product and related reports deleted successfully",
        deletedReports: reportResult.deletedCount,
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error("Error deleting product and reports:", error);
    res.status(500).json({ error: "Failed to delete product and reports" });
  } finally {
    await client.close();
  }
}
