import fs from "fs";
import path from "path";
import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  await dbConnect();
  const session = await getSession({ req });

  if (!session?.user?.contact) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const contact = session.user.contact;

    // ✅ Find user before deleting
    const user = await User.findOne({ contact });

    // ✅ Delete profile image if exists
    if (user?.photo) {
      const profilePath = path.join(process.cwd(), "public", user.photo);
      if (fs.existsSync(profilePath)) {
        fs.unlinkSync(profilePath);
      }
    }

    // ✅ Delete product images
    const products = await Product.find({ ownerEmail: contact });
    products.forEach((product) => {
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach((imgPath) => {
          const fullPath = path.join(process.cwd(), "public", imgPath);
          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
          }
        });
      }
    });

    // ✅ Delete products and user
    await Product.deleteMany({ ownerEmail: contact });
    await User.deleteOne({ contact });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
