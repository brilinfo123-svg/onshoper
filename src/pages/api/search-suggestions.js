import connectToDatabase from "@/lib/mongodb";
import Product from "@/models/Product";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  const { q } = req.query;

  // 👇 Empty or very small search → no suggestions
  if (!q || q.trim().length < 2) {
    return res.status(200).json({
      success: true,
      data: [],
    });
  }

  try {
    await connectToDatabase();

    // 🔥 Case-insensitive regex search
    const regex = new RegExp(q, "i");

    const products = await Product.find(
      {
        $or: [
          { title: regex },
          { category: regex },
          { subcategory: regex },
          { brand: regex },
          { model: regex },
          { MobileBrand: regex },
          { MobileModel: regex },
          { BicyclesBrand: regex },
          { carBrand: regex },
          { carModel: regex },
          { commercialBrand: regex },
          { commercialModel: regex },
        ],
      },
      {
        title: 1,
        brand: 1,
        model: 1,
        MobileBrand: 1,
        MobileModel: 1,
        BicyclesBrand: 1,
        carBrand: 1,
        carModel: 1,
        commercialBrand: 1,
        commercialModel: 1,
      }
    )
      .limit(8) // 👈 max 8 suggestions
      .lean();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("❌ Search suggestions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
