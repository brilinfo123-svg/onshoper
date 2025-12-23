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
        // 👇 Only return fields you need
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
        coverImage: 1, // 👈 ONLY THIS IMAGE FIELD
      }
    )
      .limit(8)
      .lean();

    // 👇 Format output: image = coverImage only
    const formatted = products.map((p) => ({
      ...p,
      image: p.coverImage || "/images/placeholder.png",
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Search suggestions error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
