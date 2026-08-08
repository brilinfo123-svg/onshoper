import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);

    return res.status(405).json({
      error: `Method ${req.method} Not Allowed`,
    });
  }

  try {
    await dbConnect();

    const verifications = await UserVerification.find({
      status: "Pending",
    })
      .sort({ createdAt: -1 })
      .lean();

    console.log(
      "Pending verification requests:",
      verifications.length
    );

    return res.status(200).json(verifications);
  } catch (error) {
    console.error("Get verifications error:", error);

    return res.status(500).json({
      error: "Failed to fetch verification requests",
    });
  }
}