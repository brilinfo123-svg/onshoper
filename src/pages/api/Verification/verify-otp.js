import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";
import User from "@/models/User";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const { contact, otp } = req.body;

  if (!contact || !otp) {
    return res.status(400).json({ error: "Missing contact or OTP" });
  }

  const record = await Otp.findOne({ contact });

  if (!record) {
    return res.status(401).json({ error: "OTP not found" });
  }

  if (Date.now() > record.expiresAt.getTime()) {
    return res.status(401).json({ error: "OTP expired" });
  }

  if (otp !== record.otp) {
    return res.status(401).json({ error: "Invalid OTP" });
  }

  await Otp.deleteOne({ contact });

  let user = await User.findOne({ contact });

  if (!user) {
    user = await User.create({ contact });
  }

  res.status(200).json({ user });
}
