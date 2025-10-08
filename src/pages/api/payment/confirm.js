import connectToDatabase from "../../../lib/mongodb";
import ShopOwner from '@/models/ShopOwner';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { shopOwnerID, transactionId, method, amount, category } = req.body;

  if (!shopOwnerID || !category) {
    return res.status(400).json({ success: false, message: "Missing shopOwnerID or category" });
  }

  await connectToDatabase();

  await ShopOwner.updateOne(
    { shopOwnerID },
    {
      $addToSet: { paidCategories: category }, // ✅ Add category to paid list
      paidUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      $push: {
        paymentHistory: {
          category,
          amount,
          date: new Date(),
          transactionId,
          method
        }
      }
    },
    { upsert: true }
  );

  res.status(200).json({ success: true });
}
