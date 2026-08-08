import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await dbConnect();

  const { contact, loginType } = req.body;
  if (!contact || !loginType) {
    return res.status(400).json({ error: "Contact and loginType required" });
  }

  // ✅ Normalize only for mobile
  let normalizedContact = contact;
  if (loginType === "mobile") {
    normalizedContact = contact.toString().trim().replace(/\D/g, "");
    if (!normalizedContact.startsWith("91")) {
      normalizedContact = "91" + normalizedContact;
    }
  }
  // ✅ For email, keep contact as-is

  const record = await Otp.findOne({ contact: normalizedContact });
  if (!record) {
    return res.status(404).json({ error: "OTP not found" });
  }

  const serverNow = Date.now();
  const expiresMs = record.expiresAt.getTime();
  const remainingMs = Math.max(0, expiresMs - serverNow);
  const remainingSeconds = Math.floor(remainingMs / 1000);
  const isExpired = remainingSeconds === 0;

  return res.status(200).json({
    expiresAt: record.expiresAt.toISOString(), // expiry timestamp
    serverNow,                                 // server time for sync
    remainingSeconds,                          // 👈 direct countdown value
    isExpired,
  });
}
