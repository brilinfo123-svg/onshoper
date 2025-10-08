// pages/api/user/byContact.ts
import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  const contact = req.query.contact || req.body.contact;

  if (!contact) {
    return res.status(400).json({ error: "Contact is required" });
  }

  try {
    const user = await User.findOne({ contact });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      name: user.name,
      photo: user.photo,
      email: user.email,
      mobile: user.mobile,
      contact: user.contact,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
