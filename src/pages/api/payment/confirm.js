import connectToDatabase from "../../../lib/mongodb";
import ShopOwner from "@/models/ShopOwner";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { shopOwnerID, transactionId, method, amount, category } = req.body;

  if (!shopOwnerID || !category) {
    return res.status(400).json({ success: false, message: "Missing shopOwnerID or category" });
  }

  await connectToDatabase();

  const now = new Date();
  const twoMonths = 60 * 24 * 60 * 60 * 1000; // ✅ 2 months in ms (approx 60 days)

  // 🔍 Find shopOwner
  let shopOwner = await ShopOwner.findOne({ shopOwnerID });

  if (!shopOwner) {
    // ✅ If shopOwner not found, create new document
    shopOwner = new ShopOwner({
      shopOwnerID,
      paidCategories: [],
      paymentHistory: [],
    });
  }

  // Check if category already exists
  const existingPayment = shopOwner.paymentHistory.find(
    (p) => p.category === category
  );

  if (existingPayment) {
    // ✅ Renew → update expiry only
    let newExpiry;
    if (existingPayment.expiryAt > now) {
      newExpiry = new Date(existingPayment.expiryAt.getTime() + twoMonths);
    } else {
      newExpiry = new Date(now.getTime() + twoMonths);
    }

    existingPayment.expiryAt = newExpiry;
    existingPayment.transactionId = transactionId;
    existingPayment.method = method;
    existingPayment.amount = amount;
    existingPayment.createdAt = now;

    await shopOwner.save();

    return res.status(200).json({
      success: true,
      message: `Renewed category ${category}, expiry extended (+2 months)`,
      expiryAt: newExpiry,
    });
  } else {
    // ✅ New category → insert fresh entry
    const expiryAt = new Date(now.getTime() + twoMonths);

    shopOwner.paidCategories.push(category);
    shopOwner.paymentHistory.push({
      category,
      amount,
      createdAt: now,
      expiryAt,
      transactionId,
      method,
    });

    await shopOwner.save();

    return res.status(200).json({
      success: true,
      message: `New payment recorded for category ${category} (+2 months)`,
      expiryAt,
    });
  }
}
