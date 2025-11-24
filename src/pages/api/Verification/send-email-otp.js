import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Email required" });
  }

  // ✅ Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(contact)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  // ✅ Save OTP in DB
  await Otp.findOneAndUpdate(
    { contact },
    { otp, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  try {
    // ✅ Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Stylish HTML template
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
          <div style="background:#4CAF50; padding:15px; text-align:center; color:#fff;">
            <h2 style="margin:0;">Login Verification</h2>
          </div>
          <div style="padding:20px; text-align:center;">
            <p style="font-size:16px; color:#333;">Hello 👋,</p>
            <p style="font-size:16px; color:#333;">Use the following One-Time Password (OTP) to complete your login:</p>
            <h1 style="font-size:32px; letter-spacing:4px; color:#4CAF50; margin:20px 0;">${otp}</h1>
            <p style="font-size:14px; color:#555;">This OTP is valid for <strong>5 minutes</strong>. Please do not share it with anyone.</p>
            <div style="margin-top:30px;">
              <a href="https://onshoper.com" style="background:#4CAF50; color:#fff; padding:12px 24px; text-decoration:none; border-radius:4px; font-size:16px;">Go to Onshoper</a>
            </div>
          </div>
          <div style="background:#f1f1f1; padding:10px; text-align:center; font-size:12px; color:#777;">
            <p>&copy; ${new Date().getFullYear()} Onshoper. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"Onshoper" <${process.env.EMAIL_USER}>`,
      to: contact,
      subject: "Onshoper OTP Verification",
      html: htmlTemplate, // 👈 Stylish HTML email
    });

    res.status(200).json({ success: true, message: "OTP sent successfully", expiresAt });
  } catch (error) {
    console.error("Email OTP error:", error);
    res.status(500).json({ success: false, error: "Failed to send OTP via email" });
  }
}
