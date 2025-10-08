import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test';
const DATABASE_NAME = "test";
const COLLECTION_NAME = "localshops";

interface Service {
  _id: string;
  name: string;
  price: string;
  discount: string;
}

interface LocalShop {
  _id: ObjectId;
  services: Service[];
}

let cachedClient: MongoClient | null = null;

async function getClient() {
  if (cachedClient) return cachedClient;

  cachedClient = new MongoClient(MONGODB_URI);
  await cachedClient.connect();
  return cachedClient;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { _id, services } = req.body;

    // Validate input
    if (!_id || !services || !Array.isArray(services)) {
      return res.status(400).json({ message: "Invalid or missing parameters" });
    }

    try {
      const client = await getClient();
      const db = client.db(DATABASE_NAME);
      const collection = db.collection<LocalShop>(COLLECTION_NAME);

      // Append services to the existing services array
      const result = await collection.updateOne(
        { _id: new ObjectId(_id) },
        { $push: { services: { $each: services } } }
      );

      if (result.modifiedCount > 0) {
        return res.status(200).json({ message: "Services added successfully!" });
      } else {
        return res.status(404).json({ message: "Object not found" });
      }
    } catch (error) {
      console.error("Error adding services:", error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
