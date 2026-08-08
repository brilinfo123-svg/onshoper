import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "20mb",
    },
  },
};

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const {
      userId,
      idType,
      frontImage,
      backImage,
      selfieImage,
    } = req.body;

    // =========================
    // VALIDATE USER ID
    // =========================

    if (!userId) {
      return res.status(400).json({
        error: "userId is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Invalid userId format",
      });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // =========================
    // FIND USER
    // =========================

    const user = await User.findById(objectId).select(
      "_id contact email"
    );

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Your User document uses `contact`
    const email = user.contact || user.email;

    console.log("USER FOUND:", user);
    console.log("USER EMAIL:", email);

    if (!email) {
      return res.status(400).json({
        error: "User email not found",
      });
    }

    // =========================
    // UPLOAD FRONT IMAGE
    // =========================

    const frontUpload = await cloudinary.uploader.upload(
      frontImage,
      {
        folder: "verification/id",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      }
    );

    // =========================
    // UPLOAD BACK IMAGE
    // =========================

    const backUpload = await cloudinary.uploader.upload(
      backImage,
      {
        folder: "verification/id",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      }
    );

    // =========================
    // UPLOAD SELFIE
    // =========================

    const selfieUpload = await cloudinary.uploader.upload(
      selfieImage,
      {
        folder: "verification/selfie",
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      }
    );

    // =========================
    // SAVE VERIFICATION
    // =========================

    const record = await UserVerification.findOneAndUpdate(
      {
        userId: objectId,
      },
      {
        userId: objectId,

        // ✅ SAVE EMAIL
        email: email.toLowerCase().trim(),

        idType,

        frontImage: frontUpload.secure_url,

        backImage: backUpload.secure_url,

        selfieImage: selfieUpload.secure_url,

        selfieVerified: true,

        status: "Pending",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      }
    );

    console.log("VERIFICATION SAVED:", record);

    return res.status(200).json({
      message: "Verification submitted successfully",
      record,
    });

  } catch (error) {
    console.error("Upload error:", error);

    return res.status(500).json({
      error: "Upload failed",
    });
  }
}