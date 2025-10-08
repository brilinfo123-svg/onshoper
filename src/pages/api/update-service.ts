import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test";
let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;
  cachedClient = new MongoClient(MONGODB_URI);
  await cachedClient.connect();
  return cachedClient;
}

export default async function handler(req, res) {
  if (req.method === "PUT") {
    const { serviceId, updatedService } = req.body;

    if (!serviceId || !updatedService) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    try {
      const client = await getClient();
      const db = client.db("test");
      const shopsCollection = db.collection("localshops");

      // Update query: Match directly by the string "serviceId"
      const result = await shopsCollection.updateOne(
        { "services._id": serviceId }, // Match using the serviceId string
        {
          $set: {
            "services.$.name": updatedService.name,
            "services.$.price": updatedService.price,
            "services.$.discount": updatedService.discount,
          },
        }
      );

      if (result.modifiedCount > 0) {
        return res.status(200).json({ message: "Service updated successfully" });
      } else {
        return res.status(404).json({ message: "Service not found" });
      }
    } catch (error) {
      console.error("Error updating service:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
