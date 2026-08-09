import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import User from "@/models/User";
import cloudinary from "@/lib/cloudinary";
import nodemailer from "nodemailer";

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
    const { userId, name, idType, frontImage, backImage, selfieImage } = req.body;

    // =========================
    // VALIDATE USER ID
    // =========================
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    // =========================
    // FIND USER
    // =========================
    const user = await User.findById(objectId).select("_id contact email");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const email = user.contact || user.email;
    if (!email) {
      return res.status(400).json({ error: "User email not found" });
    }

    console.log("USER FOUND:", user);
    console.log("USER EMAIL:", email);

    // =========================
    // UPLOAD IMAGES
    // =========================
    const frontUpload = await cloudinary.uploader.upload(frontImage, {
      folder: "verification/id",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    const backUpload = await cloudinary.uploader.upload(backImage, {
      folder: "verification/id",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    const selfieUpload = await cloudinary.uploader.upload(selfieImage, {
      folder: "verification/selfie",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    // =========================
    // SAVE VERIFICATION RECORD
    // =========================
    const record = await UserVerification.findOneAndUpdate(
      { userId: objectId },
      {
        userId: objectId,
        name: name?.trim(),
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

    // =========================
    // SEND EMAIL TO ADMIN
    // =========================
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
          <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
            <div style="width:100%;padding:40px 15px;background:#f4f7fb;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
                style="max-width:620px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#111827,#374151);padding:30px 20px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:bold;">OnShopper</h1>
                    <p style="margin:7px 0 0;color:#d1d5db;font-size:14px;">Admin Verification System</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:35px 30px;">
                    <h2 style="margin:0 0 12px;color:#111827;font-size:24px;">🔔 New Verification Request</h2>
                    <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">
                      A new user has submitted their identity verification documents and selfie.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0"
                      style="margin-top:25px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                          <div style="font-size:12px;color:#6b7280;margin-bottom:5px;">USER NAME</div>
                          <div style="font-size:15px;color:#111827;font-weight:bold;">${name}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                          <div style="font-size:12px;color:#6b7280;margin-bottom:5px;">USER EMAIL</div>
                          <div style="font-size:15px;color:#111827;font-weight:bold;">${email}</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:16px 20px;border-bottom:1px solid #e5e7eb;">
                          <div style="font-size:12px;color:#6b7280;margin-bottom:5px;">ID TYPE</div>
                          <div style="font-size:15px;color:#111827;font-weight:bold;">${idType}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>
          </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"OnShopper" <${process.env.EMAIL_USER}>`,
        to: "onshoper390@gmail.com",
        subject: "🔔 New Verification Request - OnShopper",
        html: htmlTemplate,
      });

      console.log("✅ Admin notification email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send admin notification email:", emailError);
    }

    return res.status(200).json({
      message: "Verification submitted successfully",
      record,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }
}
