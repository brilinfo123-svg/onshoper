import dbConnect from "@/lib/mongodb";
import User from "../../models/User";



export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  await dbConnect();

  // Save FCM token to user collection
  await User.updateOne(
    { email: req.session.user.email },
    { $set: { fcmToken: token } }
  );

  res.status(200).json({ success: true });
}
