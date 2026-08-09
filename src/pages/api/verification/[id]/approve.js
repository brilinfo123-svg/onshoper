import mongoose from "mongoose";
import dbConnect from "../../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);

    return res
      .status(405)
      .json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const { id } = req.query;

    // =========================
    // VALIDATE VERIFICATION ID
    // =========================

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "Verification ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        error: "Invalid verification ID",
      });
    }

    // =========================
    // FIND VERIFICATION
    // =========================

    const verification = await UserVerification.findById(id);

    if (!verification) {
      return res.status(404).json({
        error: "Verification not found",
      });
    }

    // =========================
    // GET EMAIL
    // =========================

    const email = verification.email;

    if (!email) {
      return res.status(400).json({
        error: "User email not found in verification record",
      });
    }

    // =========================
    // UPDATE STATUS
    // =========================

    verification.status = "Approved";

    await verification.save();

    // =========================
    // SEND APPROVAL EMAIL
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
      <div style="margin:0;padding:40px 15px;background:#f4f7fb;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%"
        style="max-width:620px;margin:auto;background:#fff;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.08);">
    
        <!-- HEADER -->
        <tr>
          <td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:30px 20px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:30px;font-weight:bold;">OnShoper</h1>
            <p style="margin:8px 0 0;color:#dcfce7;font-size:14px;">Verification Approved</p>
          </td>
        </tr>
    
        <!-- CONTENT -->
        <tr>
          <td style="padding:35px 30px;text-align:center;">
            <div style="width:70px;height:70px;line-height:70px;margin:0 auto 20px;background:#dcfce7;border-radius:50%;color:#16a34a;font-size:38px;font-weight:bold;">
              ✓
            </div>
    
            <h2 style="margin:0 0 15px;color:#111827;font-size:24px;">Verification Approved</h2>
    
            <p style="margin:0;color:#4b5563;font-size:16px;line-height:1.6;">
              Congratulations! Your identity verification has been successfully approved.
            </p>
    
            <div style="margin:25px 0;padding:18px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;text-align:left;">
              <p style="margin:0 0 8px;color:#374151;font-size:14px;">
                <strong>Status:</strong> <span style="color:#16a34a;">Approved</span>
              </p>
              <p style="margin:0;color:#374151;font-size:14px;">
                <strong>ID Type:</strong> ${verification.idType || "Government ID"}
              </p>
            </div>
    
            <!-- NEW FEATURE SECTION -->
            <div style="margin-top:30px;text-align:center;">
              <p style="margin:0 0 50px;color:#374151;font-size:15px;">
                As a verified user, you can now post rental products and start earning.
              </p>
              <a href="http://onshoper.com/productForm"
                style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:14px 28px;border-radius:9px;font-size:14px;font-weight:bold;">
                Post Your Product
              </a>
            </div>
          </td>
        </tr>
    
        <!-- FOOTER -->
        <tr>
          <td style="background:#f3f4f6;padding:22px;text-align:center;">
            <p style="margin:0;font-size:14px;color:#6b7280;">
              Need help?
              <a href="http://onshoper.com/contact-us" style="color:#2563eb;text-decoration:none;">Contact Support</a>
            </p>
            <p style="margin-top:12px;font-size:13px;color:#9ca3af;">
              © ${new Date().getFullYear()} OnShoper. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </div>    
      `;

      await transporter.sendMail({
        from: `"OnShoper" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "OnShoper Verification Approved",
        html: htmlTemplate,
      });

      console.log("Approval email sent to:", email);
    } catch (emailError) {
      console.error("Approval email error:", emailError);

      // Verification is already approved.
      // We don't want email failure to undo approval.
      return res.status(200).json({
        success: true,
        message: "Verification approved, but email could not be sent",
        emailSent: false,
        verification,
      });
    }

    // =========================
    // SUCCESS
    // =========================

    return res.status(200).json({
      success: true,
      message: "Verification approved and email sent successfully",
      emailSent: true,
      verification,
    });

  } catch (error) {
    console.error("Approve verification error:", error);

    return res.status(500).json({
      error: "Failed to approve verification",
    });
  }
}