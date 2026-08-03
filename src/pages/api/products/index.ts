import type { NextApiRequest, NextApiResponse } from "next";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "";
let client: MongoClient | null = null;

// ===============================
// 📦 CONNECT MONGODB
// ===============================
async function connectDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    console.log("✅ MongoDB Connected");
  }
  return client;
}

// ===============================
// 📦 API HANDLER
// ===============================
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  try {
    const client = await connectDB();
    const db = client.db("test");
    const collection = db.collection("products");

    // ===============================
    // 📌 FETCH ALL PRODUCTS
    // ===============================
    const products = await collection
      .find(
        {
          status: { $ne: "sold" },
        },
        {
          projection: {
            title: 1,
            category: 1,
            subcategory: 1,
            SaleType: 1,
            type: 1,
            feature: 1,
            coverImage: 1,
            images: { $slice: 1 },
            price: 1,
            priceWeek: 1,
            priceMonth: 1,
            SalePrice: 1,
            location: 1,
            createdAt: 1,
            shopOwnerID: 1,
            year: 1,
            KmDriven: 1,
            MobileBrand: 1,
            MobileModel: 1,
            salaryFrom: 1,
            salaryTo: 1,
            salaryPeriod: 1,
            positionType: 1,
          },
        }
      )
      .sort({ createdAt: -1 })
      .toArray();

    console.log("✅ Products fetched:", products.length);

    return res.status(200).json({
      success: true,
      products,
      total: products.length,
    });
  } catch (err) {
    console.error("❌ Error fetching products:", err);

    return res.status(500).json({
      success: false,
      message: "Error fetching products",
    });
  }
}