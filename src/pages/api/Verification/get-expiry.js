import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ error: "Contact required" });
  }

  // ✅ Normalize exactly like send-otp / verify-otp
  let normalizedContact = contact.toString().trim().replace(/\D/g, "");
  if (!normalizedContact.startsWith("91")) {
    normalizedContact = "91" + normalizedContact;
  }

  const record = await Otp.findOne({ contact: normalizedContact });
  if (!record) {
    return res.status(404).json({ error: "OTP not found" });
  }

  const serverNow = Date.now();
  const expiresMs = record.expiresAt.getTime();
  const remainingMs = Math.max(0, expiresMs - serverNow);
  const isExpired = remainingMs === 0;

  return res.status(200).json({
    expiresAt: record.expiresAt.toISOString(), // for reference
    serverNow,                                 // helps client sync
    remainingMs,                               // use this for countdown
    isExpired,
  });
}
