import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import cloudinary from "@/lib/cloudinary";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { selfieImage, userId } = req.body;

      // ✅ Validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId format" });
      }

      const objectId = new mongoose.Types.ObjectId(userId);

      // ✅ Upload selfie to Cloudinary
      const selfieUpload = await cloudinary.uploader.upload(selfieImage, {
        folder: "verification/selfie",
      });

      // ✅ Update or create record
      const record = await UserVerification.findOneAndUpdate(
        { userId: objectId },
        { selfieVerified: true, selfieImage: selfieUpload.secure_url },
        { new: true, upsert: true } // 👈 create if not exists
      );

      // ✅ Always return image URL
      return res.status(200).json({
        message: "Selfie uploaded successfully",
        selfieImage: selfieUpload.secure_url, // 👈 fallback
        record,
      });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
