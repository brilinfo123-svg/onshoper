import dbConnect from "../../../lib/mongodb";
import Product from "@/models/Product";
import cloudinary from "../../../lib/cloudinary";

// ✅ Extract full public ID from Cloudinary URL (including folder)
const extractPublicId = (url) => {
  try {
    const afterUpload = url.split("/upload/")[1]; // e.g., v1760030499/product-images/abc123.jpg
    const publicIdWithVersion = afterUpload.split("/").slice(1).join("/"); // remove version
    const publicId = publicIdWithVersion.split(".")[0]; // remove .jpg/.png/.pdf
    return publicId; // e.g., product-images/abc123
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  await dbConnect();

  const { id } = req.query;

  if (req.method === "DELETE") {
    try {
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // ✅ Collect all image and file URLs
      const allAssets = [
        ...(product.images || []),
        product.coverImage,
        product.rentalTermsFile,
      ];

      // ✅ Delete each asset from Cloudinary
      for (const url of allAssets) {
        const publicId = extractPublicId(url);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      // ✅ Delete product from MongoDB
      await Product.findByIdAndDelete(id);

      res.status(200).json({ message: "Deleted successfully" });
    } catch (err) {
      console.error("Delete error:", err);
      res.status(500).json({ error: "Server error" });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
