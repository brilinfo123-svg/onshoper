import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

  await Otp.findOneAndUpdate(
    { contact },
    { otp, expiresAt },
    { upsert: true }
  );

  console.log(`OTP for ${contact} is ${otp}`); // For dev logging

  // ✅ Return OTP in response (for testing only)
  res.status(200).json({ success: true, otp });
}
