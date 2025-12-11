import { admin } from "@/lib/firebaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { token, title, body } = req.body;

    const message = {
      token,
      notification: { title, body },
    };

    // ✅ Correct usage
    const response = await admin.messaging().send(message);

    res.status(200).json({ success: true, messageId: response });
  } catch (err) {
    console.error("❌ FCM send error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
}
