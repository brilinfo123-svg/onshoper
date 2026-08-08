import dbConnect from "../../../lib/mongodb"; 
import UserVerification from "@/models/UserVerification";

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === "PUT") {
    const { userId, status } = req.body;

    const record = await UserVerification.findOneAndUpdate(
      { userId },
      { status },
      { new: true }
    );

    return res.status(200).json({ message: "Status updated", record });
  }
}
