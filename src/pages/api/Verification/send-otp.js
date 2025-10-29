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
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // ⏱️ 2 minutes expiry

  await Otp.findOneAndUpdate(
    { contact },
    { otp, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  console.log(`OTP for ${contact} is ${otp}`);

  res.status(200).json({ success: true, otp }); // Return OTP for testing only
}
