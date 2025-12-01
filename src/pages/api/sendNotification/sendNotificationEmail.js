import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ✅ Stylish HTML wrapper (generic)
    const htmlTemplate = `
      <div style="font-family: Arial, sans-serif; background-color:#f9f9f9; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); overflow:hidden;">
          <div style="background:#4CAF50; padding:15px; text-align:center; color:#fff;">
            <h2 style="margin:0;">${subject}</h2>
          </div>
          <div style="padding:20px; text-align:center;">
            <p style="font-size:16px; color:#333;">${text}</p>
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

    // ✅ Send email
    await transporter.sendMail({
      from: `"Onshoper" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlTemplate, // 👈 use HTML instead of plain text
    });

    res.status(200).json({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}
