import dbConnect from "../../../lib/mongodb";
import UserVerification from "@/models/UserVerification";

export default async function handler(req, res) {
  await dbConnect();

  const { userId } = req.query;
  const record = await UserVerification.findOne({ userId });

  return res.status(200).json(record);
}
