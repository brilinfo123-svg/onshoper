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
            <div style="margin:0;padding:40px 15px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:620px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08)">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#1d4ed8);padding:25px 0 10px;text-align:center">
                    <h1 style="margin:0;color:#fff;font-size:30px;font-weight:bold">OnShoper</h1>
                    <p style="margin-top:5px;color:#dbeafe;font-size:14px">Login Verification</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 25px;text-align:center">
                    <div style="display:inline-block;margin:20px 0;padding:16px 40px;background:#f8fbff;border:2px dashed #2563eb;border-radius:14px; letter-spacing: 1.5px; font-size:34px;font-weight:bold;color:#000">
                      ${otp}
                    </div>
                    <p style="margin-top:5px;font-size:14px;color:#6b7280">Code expires in <strong style="color:#ef4444">5 minutes</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f3f4f6;padding:22px;text-align:center">
                    <p style="margin:0;font-size:14px;color:#6b7280">Need help? <a href="http://onshoper.com/contact-us" style="color:#2563eb;text-decoration:none">Contact Support</a></p>
                    <p style="margin-top:12px;font-size:13px;color:#9ca3af">© ${new Date().getFullYear()} OnShoper. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </div>`;

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
