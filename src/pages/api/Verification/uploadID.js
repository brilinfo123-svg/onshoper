import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import cloudinary from "@/lib/cloudinary";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "POST") {
    const { idType, userId, frontImage, backImage } = req.body;

    // Upload images to Cloudinary
    const frontUpload = await cloudinary.uploader.upload(frontImage, {
      folder: "verification/id",
    });
    const backUpload = await cloudinary.uploader.upload(backImage, {
      folder: "verification/id",
    });

    const record = await UserVerification.findOneAndUpdate(
      { userId },
      {
        idType,
        frontImage: frontUpload.secure_url,
        backImage: backUpload.secure_url,
        status: "Pending",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({ message: "ID uploaded successfully", record });
  }
}
