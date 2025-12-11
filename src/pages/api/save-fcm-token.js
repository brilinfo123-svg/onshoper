import dbConnect from "@/lib/mongodb";
import User from "../../models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]"; // 👈 fixed path

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  await dbConnect();

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, error: "Not authenticated" });
  }

  await User.updateOne(
    { email: session.user.email },
    { $set: { fcmToken: token } }
  );

  res.status(200).json({ success: true });
}
