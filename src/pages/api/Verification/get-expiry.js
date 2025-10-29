import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact required" });
  }

  const record = await Otp.findOne({ contact });

  if (!record) {
    return res.status(404).json({ error: "OTP not found" });
  }

  res.status(200).json({ expiresAt: record.expiresAt });
}
