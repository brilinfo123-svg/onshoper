import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { name, email, message } = req.body;

    // Configure transporter (use your SMTP or Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "onshoper390@gmail.com", // company email
        pass: "yywu mmoa rswj umjq",   // Gmail App Password (store in .env for security)
      },
    });

    try {
      await transporter.sendMail({
        from: `"Sale & Rent" <onshoper390@gmail.com>`, // always use company email
        to: "onshoper390@gmail.com",                   // inbox
        subject: `New Contact Query from ${name}`,
        replyTo: email,                                // reply goes to user
        text: message,                                 // plain text fallback
        html: `
          <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333;">
            <h2 style="color:#00796b;">📩 New Contact Query</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="padding:10px; background:#f9f9f9; border-radius:8px; border:1px solid #ddd;">
              ${message}
            </div>
            <hr style="margin:20px 0; border:none; border-top:1px solid #eee;" />
            <p style="font-size:0.9rem; color:#555;">
              This query was submitted via the Contact Us form on <strong>Sale & Rent</strong>.
            </p>
          </div>
        `,
      });

      res.status(200).json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending email:", error);
      res.status(500).json({ success: false, message: "Error sending email", error });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
