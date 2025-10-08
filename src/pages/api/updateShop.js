import { MongoClient, ObjectId } from "mongodb";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { _id, formData } = req.body;

      if (!_id || !formData) {
        return res.status(400).json({ success: false, message: "Missing required fields." });
      }

      // MongoDB connection
      const client = await MongoClient.connect(
        "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test",
        { useNewUrlParser: true, useUnifiedTopology: true }
      );
      const db = client.db("test");
      const collection = db.collection("localshops");

      // Update the shop document
      const result = await collection.updateOne(
        { _id: new ObjectId(_id) }, // Convert _id to ObjectId
        { $set: formData }
      );

      client.close();

      if (result.modifiedCount === 1) {
        return res.status(200).json({ success: true, message: "Shop updated successfully." });
      } else {
        return res.status(404).json({ success: false, message: "Shop not found." });
      }
    } catch (error) {
      console.error("Error updating shop:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  } else {
    return res.status(405).json({ success: false, message: "Method Not Allowed" });
  }
};

export default handler;
