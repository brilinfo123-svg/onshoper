import { MongoClient } from "mongodb";

export default async function handler(req, res) {
  if (req.method === "DELETE") {
    const { serviceId } = req.body;

    if (!serviceId) {
      return res.status(400).json({ message: "Service ID is required" });
    }

    try {
      const MONGODB_URI = "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test";
      const client = new MongoClient(MONGODB_URI);

      await client.connect();
      const db = client.db();
      const shopsCollection = db.collection("localshops");

      // Find the service by the string serviceId, no need to convert it to ObjectId
      const result = await shopsCollection.updateOne(
        { "services._id": serviceId },  // Direct comparison with serviceId as a string
        { $pull: { services: { _id: serviceId } } }
      );

      if (result.modifiedCount > 0) {
        res.status(200).json({ message: "Service deleted successfully" });
      } else {
        res.status(404).json({ message: "Service not found or already deleted" });
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
