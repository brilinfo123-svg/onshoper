import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ error: "Missing contact or OTP" });
  }

  // ✅ Normalize contact same as send-otp
  let normalizedContact = contact.toString().trim().replace(/\D/g, "");
  if (!normalizedContact.startsWith("91")) {
    normalizedContact = "91" + normalizedContact;
  }

  // ✅ Find OTP record
  const record = await Otp.findOne({ contact: normalizedContact });

  if (!record) {
    return res.status(404).json({ error: "No OTP found" });
  }

  // ✅ Check expiry
  if (Date.now() > record.expiresAt.getTime()) {
    await Otp.deleteOne({ contact: normalizedContact }); // Clean up expired OTP
    return res.status(401).json({ error: "OTP expired" });
  }

  // ✅ Check match
  if (otp !== record.otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  // ✅ OTP verified → clean up
  await Otp.deleteOne({ contact: normalizedContact });

  // ✅ Find or create user
  let user = await User.findOne({ contact: normalizedContact });
  if (!user) {
    user = await User.create({ contact: normalizedContact });
  }

  // ✅ Success response
  return res.status(200).json({
    success: true,
    message: "OTP verified successfully",
    user,
  });
}
