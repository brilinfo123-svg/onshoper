import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import cloudinary from "@/lib/cloudinary";

// ✅ Increase body size limit to avoid 413 error
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb", // adjust as needed
    },
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    try {
      const { userId, idType, frontImage, backImage, selfieImage } = req.body;

      // ✅ Validate userId
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ error: "Invalid userId format" });
      } 

      const objectId = new mongoose.Types.ObjectId(userId);

      // ✅ Upload all images to Cloudinary with optimization
      const frontUpload = await cloudinary.uploader.upload(frontImage, {
        folder: "verification/id",
        transformation: [{ quality: "auto", fetch_format: "auto" }], // optimize
      });

      const backUpload = await cloudinary.uploader.upload(backImage, {
        folder: "verification/id",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      const selfieUpload = await cloudinary.uploader.upload(selfieImage, {
        folder: "verification/selfie",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });

      // ✅ Update or create record
      const record = await UserVerification.findOneAndUpdate(
        { userId: objectId },
        {
          idType,
          frontImage: frontUpload.secure_url,
          backImage: backUpload.secure_url,
          selfieImage: selfieUpload.secure_url,
          selfieVerified: true,
          status: "Pending",
        },
        { new: true, upsert: true }
      );

      return res.status(200).json({ message: "Verification submitted successfully", record });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ error: "Upload failed" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
