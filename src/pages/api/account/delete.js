import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";
import Product from "@/models/Product";
import cloudinary from "../../../lib/cloudinary";

// ✅ Extract full public ID from Cloudinary URL
const extractPublicId = (url) => {
  try {
    if (!url || typeof url !== "string") return null;
    const afterUpload = url.split("/upload/")[1];
    if (!afterUpload) return null;
    const publicIdWithVersion = afterUpload.split("/").slice(1).join("/");
    const publicId = publicIdWithVersion.split(".")[0];
    return publicId;
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(405).end();

  await dbConnect();

  const contact = req.body?.contact || req.query?.contact;
  if (!contact) {
    return res.status(400).json({ success: false, message: "Missing contact identifier" });
  }

  try {
    // ✅ Find user
    const user = await User.findOne({ contact });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ✅ Delete profile image from Cloudinary
    if (user.photo) {
      const publicId = extractPublicId(user.photo);
      if (publicId) {
        await cloudinary.uploader.destroy(publicId);
      }
    }

    // ✅ Find all products by user
    const products = await Product.find({ ownerEmail: contact });

    for (const product of products) {
      const allImages = [
        ...(product.images || []),
        product.coverImage,
        product.rentalTermsFile,
      ];

      for (const url of allImages) {
        const publicId = extractPublicId(url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
    }

    // ✅ Delete products and user
    await Product.deleteMany({ ownerEmail: contact });
    await User.deleteOne({ contact });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
}
