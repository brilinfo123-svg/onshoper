import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb"; // adjust if needed
import Product from "@/models/Product";

export default async function handler(req, res) {
  const {
    query: { id },
    method,
  } = req;

  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    switch (method) {
      case "GET": {
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }
        return res.status(200).json({ success: true, product });
      }

      case "PUT": {
        const updatedProduct = await Product.findByIdAndUpdate(
          id,
          req.body, // 👈 expects JSON body with updated fields
          { new: true, runValidators: true }
        );

        if (!updatedProduct) {
          return res.status(404).json({ success: false, message: "Product not found" });
        }

        return res.status(200).json({ success: true, product: updatedProduct });
      }

      default:
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error in /api/products/[id]:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}