import { NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

// MongoDB connection URI
const MONGODB_URI = 'mongodb+srv://admin:admin@cluster1.pzyia.mongodb.net/test';
const client = new MongoClient(MONGODB_URI);

// Define the shape of the documents in the collection
interface LocalShop {
  _id: ObjectId;
  favorites: string[]; // `favorites` is an array of strings (shop IDs)
}

export async function POST(req: Request) {
  try {
    const { userId, shopId, isFavorited } = await req.json();

    // Ensure database connection
    const db = client.db("test");
    const collection = db.collection<LocalShop>("localShops");

    if (isFavorited) {
      // Add `shopId` to `favorites` if it doesn't already exist
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $addToSet: { favorites: shopId } }
      );
    } else {
      // Remove `shopId` from `favorites`
      await collection.updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { favorites: shopId } }
      );
    }

    // Fetch updated user data
    const user = await collection.findOne({ _id: new ObjectId(userId) });

    // Return response with updated favorites
    return NextResponse.json({ success: true, favorites: user?.favorites || [] });
  } catch (error) {
    console.error("Error managing favorites:", error);
    return NextResponse.json({ success: false, error: error.message });
  }
}
