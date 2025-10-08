import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb"; // adjust path if needed
import Product from "@/models/Product"; // You'll define this in Step 2

export default async function handler(req, res) {
    const {
      query: { id },
      method,
    } = req;
  
    await connectToDatabase();
  
    if (method !== "GET") {
      return res
        .status(405)
        .json({ success: false, message: "Method Not Allowed" });
    }
  
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product ID" });
    }
  
    try {
      const product = await Product.findById(id);
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }
  
      res.status(200).json({ success: true, product });
    } catch (error) {
      console.error("Error fetching product by ID:", error);
      res.status(500).json({ success: false, message: "Internal Server Error" });
    }
  }