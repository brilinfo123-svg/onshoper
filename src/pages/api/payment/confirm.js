import connectToDatabase from "../../../lib/mongodb";
import ShopOwner from "@/models/ShopOwner";
import Product from "@/models/Product"; // 👈 import Product model

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { shopOwnerID, contact, transactionId, method, amount, category } = req.body;

  if ((!shopOwnerID && !contact) || !category) {
    return res.status(400).json({ success: false, message: "Missing shopOwnerID/contact or category" });
  }

  await connectToDatabase();

  const now = new Date();
  const oneMinute = 1 * 60 * 1000; // ✅ 1 minute in ms (for testing)

  // 🔍 Find shopOwner by contact (preferred) or shopOwnerID
  let shopOwner = await ShopOwner.findOne(contact ? { contact } : { shopOwnerID });

  if (!shopOwner) {
    shopOwner = new ShopOwner({
      shopOwnerID,
      contact,
      hasPaid: true,
      paidUntil: new Date(now.getTime() + oneMinute),
      paidCategories: [],
      paymentHistory: [],
    });
  }

  // ✅ Always set global flags
  shopOwner.hasPaid = true;
  shopOwner.paidUntil = new Date(now.getTime() + oneMinute);

  const existingPayment = shopOwner.paymentHistory.find((p) => p.category === category);

  let newExpiry;
  if (existingPayment) {
    if (existingPayment.expiryAt > now) {
      newExpiry = new Date(existingPayment.expiryAt.getTime() + oneMinute);
    } else {
      newExpiry = new Date(now.getTime() + oneMinute);
    }

    existingPayment.expiryAt = newExpiry;
    existingPayment.transactionId = transactionId;
    existingPayment.method = method;
    existingPayment.amount = amount;
    existingPayment.createdAt = now;
  } else {
    newExpiry = new Date(now.getTime() + oneMinute);

    shopOwner.paidCategories.push(category);
    shopOwner.paymentHistory.push({
      category,
      amount,
      createdAt: now,
      expiryAt: newExpiry,
      transactionId,
      method,
      contact,
    });
  }

  // ✅ Update all products in this category for this shopOwner to new expiry
  await Product.updateMany(
    contact ? { contact, category } : { shopOwnerID, category },
    { $set: { expiresAt: newExpiry } }
  );

  await shopOwner.save();

  return res.status(200).json({
    success: true,
    message: `Payment recorded for category ${category} (+${oneMinute / 1000} seconds)`, // 👈 dynamic message
    expiryAt: shopOwner.paidUntil,
  });
}
