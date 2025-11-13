import dbConnect from '@/lib/mongodb';
import Report from '../../models/Report';

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const { productId, reason, comment } = req.body; // ✅ include comment
  if (!productId || !reason) {
    return res.status(400).json({ success: false, error: "Product ID and reason required" });
  }

  try {
    await Report.create({
        productId,
        reason,
        comment, // will save if not empty
        createdAt: new Date(),
      });      
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}
