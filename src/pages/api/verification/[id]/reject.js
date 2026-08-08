import mongoose from "mongoose";
import dbConnect from "../../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";
import cloudinary from "@/lib/cloudinary";
import nodemailer from "nodemailer";

// ============================================
// GET CLOUDINARY PUBLIC ID
// ============================================

function getCloudinaryPublicId(url) {
  try {
    if (!url) return null;

    const parsedUrl = new URL(url);
    const parts = parsedUrl.pathname.split("/");

    const uploadIndex = parts.indexOf("upload");

    if (uploadIndex === -1) {
      return null;
    }

    let publicParts = parts.slice(uploadIndex + 1);

    // Remove Cloudinary version
    // Example: v1786223548
    if (publicParts[0] && /^v\d+$/.test(publicParts[0])) {
      publicParts.shift();
    }

    const publicIdWithExtension = publicParts.join("/");

    // Remove extension
    return publicIdWithExtension.replace(/\.[^/.]+$/, "");
  } catch (error) {
    console.error("Cloudinary public ID error:", error);
    return null;
  }
}

// ============================================
// REJECT VERIFICATION
// ============================================

export default async function handler(req, res) {
  await dbConnect();

  // IMPORTANT:
  // Admin frontend must send DELETE
  if (req.method !== "DELETE") {
    res.setHeader("Allow", ["DELETE"]);

    return res.status(405).json({
      success: false,
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    // ========================================
    // GET VERIFICATION ID
    // ========================================

    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        error: "Verification ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid verification ID",
      });
    }

    // ========================================
    // GET REJECTION REASON
    // ========================================

    const { reason } = req.body || {};

    const finalReason = reason?.trim();

    if (!finalReason) {
      return res.status(400).json({
        success: false,
        error: "Rejection reason is required",
      });
    }

    // ========================================
    // FIND VERIFICATION
    // ========================================

    const verification = await UserVerification.findById(id);

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: "Verification request not found",
      });
    }

    // ========================================
    // GET EMAIL
    // ========================================

    const email = verification.email?.trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "User email not found in verification record",
      });
    }

    console.log("=================================");
    console.log("Rejecting verification:", id);
    console.log("User email:", email);
    console.log("Rejection reason:", finalReason);
    console.log("=================================");

    // ========================================
    // CREATE NODEMAILER TRANSPORTER
    // SAME AS YOUR OTP API
    // ========================================

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // ========================================
    // SEND REJECTION EMAIL
    // ========================================

    const htmlTemplate = `
      <div style="
        margin:0;
        padding:40px 15px;
        background:#f4f7fb;
        font-family:Arial,Helvetica,sans-serif;
      ">

        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          width="100%"
          style="
            max-width:620px;
            margin:auto;
            background:#fff;
            border-radius:18px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(0,0,0,.08);
          "
        >

          <!-- HEADER -->

          <tr>
            <td style="
              background:linear-gradient(135deg,#dc2626,#b91c1c);
              padding:30px 20px;
              text-align:center;
            ">

              <h1 style="
                margin:0;
                color:#fff;
                font-size:30px;
                font-weight:bold;
              ">
                OnShoper
              </h1>

              <p style="
                margin:8px 0 0;
                color:#fee2e2;
                font-size:14px;
              ">
                Identity Verification
              </p>

            </td>
          </tr>


          <!-- CONTENT -->

          <tr>
            <td style="
              padding:35px 30px;
            ">

              <h2 style="
                margin:0 0 15px;
                color:#111827;
                font-size:22px;
              ">
                Verification Rejected
              </h2>

              <p style="
                margin:0 0 20px;
                color:#4b5563;
                font-size:15px;
                line-height:1.7;
              ">
                Your identity verification request on
                <strong>OnShoper</strong>
                has been rejected.
              </p>


              <!-- REASON BOX -->

              <div style="
                margin:25px 0;
                padding:20px;
                background:#fef2f2;
                border:1px solid #fecaca;
                border-left:5px solid #dc2626;
                border-radius:10px;
              ">

                <p style="
                  margin:0 0 10px;
                  color:#991b1b;
                  font-size:14px;
                  font-weight:bold;
                ">
                  Rejection Reason
                </p>

                <p style="
                  margin:0;
                  color:#7f1d1d;
                  font-size:15px;
                  line-height:1.6;
                ">
                  ${finalReason}
                </p>

              </div>


              <p style="
                margin:20px 0 0;
                color:#4b5563;
                font-size:15px;
                line-height:1.7;
              ">
                Please review the reason above and submit your
                verification documents again with the correct
                information.
              </p>


              <p style="
                margin:20px 0 0;
                color:#4b5563;
                font-size:15px;
                line-height:1.7;
              ">
                If you believe this rejection was made by mistake,
                please contact OnShoper support.
              </p>


              <p style="
                margin:30px 0 0;
                color:#374151;
                font-size:15px;
                line-height:1.6;
              ">
                Regards,<br />
                <strong>OnShoper Team</strong>
              </p>

            </td>
          </tr>


          <!-- FOOTER -->

          <tr>
            <td style="
              background:#f3f4f6;
              padding:22px;
              text-align:center;
            ">

              <p style="
                margin:0;
                font-size:13px;
                color:#6b7280;
              ">
                Need help?
                <a
                  href="http://onshoper.com/contact-us"
                  style="
                    color:#2563eb;
                    text-decoration:none;
                  "
                >
                  Contact Support
                </a>
              </p>

              <p style="
                margin:10px 0 0;
                font-size:12px;
                color:#9ca3af;
              ">
                © ${new Date().getFullYear()}
                OnShoper. All rights reserved.
              </p>

            </td>
          </tr>

        </table>

      </div>
    `;

    await transporter.sendMail({
      from: `"OnShoper" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OnShoper Verification Was Rejected",
      html: htmlTemplate,
    });

    console.log("Rejection email sent to:", email);

    // ========================================
    // GET CLOUDINARY PUBLIC IDS
    // ========================================

    const frontPublicId = getCloudinaryPublicId(
      verification.frontImage
    );

    const backPublicId = getCloudinaryPublicId(
      verification.backImage
    );

    const selfiePublicId = getCloudinaryPublicId(
      verification.selfieImage
    );

    // ========================================
    // DELETE CLOUDINARY IMAGES
    // ========================================

    const deleteResults = [];

    // FRONT
    if (frontPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          frontPublicId,
          {
            resource_type: "image",
            type: "upload",
          }
        );

        deleteResults.push({
          image: "front",
          publicId: frontPublicId,
          result: result.result,
        });
      } catch (error) {
        console.error(
          "Failed to delete front image:",
          error
        );
      }
    }

    // BACK
    if (backPublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          backPublicId,
          {
            resource_type: "image",
            type: "upload",
          }
        );

        deleteResults.push({
          image: "back",
          publicId: backPublicId,
          result: result.result,
        });
      } catch (error) {
        console.error(
          "Failed to delete back image:",
          error
        );
      }
    }

    // SELFIE
    if (selfiePublicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          selfiePublicId,
          {
            resource_type: "image",
            type: "upload",
          }
        );

        deleteResults.push({
          image: "selfie",
          publicId: selfiePublicId,
          result: result.result,
        });
      } catch (error) {
        console.error(
          "Failed to delete selfie image:",
          error
        );
      }
    }

    // ========================================
    // DELETE VERIFICATION FROM MONGODB
    // ========================================

    await UserVerification.findByIdAndDelete(id);

    // ========================================
    // SUCCESS
    // ========================================

    return res.status(200).json({
      success: true,
      message: "Verification rejected successfully",
      emailSent: true,
      email,
      reason: finalReason,

      deleted: {
        mongodb: true,
        cloudinary: deleteResults,
      },
    });

  } catch (error) {
    console.error("Reject verification error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to reject verification",
    });
  }
}