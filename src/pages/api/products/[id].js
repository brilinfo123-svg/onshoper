import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import Product from "@/models/Product";
import User from "@/models/User";
import Favorite from "@/models/Favorites";

export default async function handler(req, res) {
  const {
    query: { id, userId },
    method,
  } = req;

  if (method !== "GET") {
    return res.status(405).json({
      success: false,
      message: "Method Not Allowed",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid product ID",
    });
  }

  try {
    await connectToDatabase();

    /* 🔹 1️⃣ Fetch Product */
    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    /* 🔹 2️⃣ Fetch Seller (FIXED) */
    let seller = null;

    if (product.shopOwnerID && mongoose.Types.ObjectId.isValid(product.shopOwnerID)) {
      seller = await User.findById(product.shopOwnerID)
        .select("name contact mobile photo")
        .lean();
    }

    /* 🔹 3️⃣ Favourite Status */
    let isFavourite = false;

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      const fav = await Favorite.findOne({
        userId,
        productId: id,
      }).lean();

      isFavourite = !!fav;
    }

    /* ✅ Final Response */
    return res.status(200).json({
      success: true,
      product,
      seller,
      isFavourite,
    });
  } catch (error) {
    console.error("❌ Product details error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
