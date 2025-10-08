import dbConnect from "../../../lib/mongodb";
import User from "@/models/User";

export default async function handler(req, res) {
  await dbConnect();

  const method = req.method;

  if (method === "GET") {
    const { contact } = req.query;

    if (!contact || typeof contact !== "string") {
      return res.status(400).json({ error: "Missing or invalid contact" });
    }

    try {
      const user = await User.findOne({ contact });

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { name, email, mobile, photo } = user;
      return res.status(200).json({ name, email, mobile, photo });
    } catch (error) {
      console.error("GET /profile error:", error);
      return res.status(500).json({ error: "Failed to fetch profile" });
    }
  }

  if (method === "POST") {
    const { contact, name, email, mobile, photo } = req.body;

    if (!contact || typeof contact !== "string") {
      return res.status(400).json({ error: "Missing or invalid contact" });
    }

    try {
      const updateResult = await User.updateOne(
        { contact },
        { $set: { name, email, mobile, photo } },
        { upsert: true }
      );

      if (updateResult.modifiedCount === 0 && !updateResult.upsertedCount) {
        return res.status(304).json({ message: "No changes made" });
      }

      return res.status(200).json({ success: true, message: "Profile updated" });
    } catch (error) {
      console.error("POST /profile error:", error);
      return res.status(500).json({ error: "Failed to update profile" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
