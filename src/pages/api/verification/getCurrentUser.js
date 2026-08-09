import mongoose from "mongoose";
import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid userId format" });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const record = await UserVerification.findOne({ userId: objectId })
      .select("idType name status")
      .lean();

    if (!record) {
      return res.status(404).json({ error: "Verification record not found" });
    }

    return res.status(200).json({
      idType: record.idType,
      name: record.name,
      status: record.status,
    });
  } catch (error) {
    console.error("Fetch verification error:", error);
    return res.status(500).json({ error: "Failed to fetch verification record" });
  }
}
