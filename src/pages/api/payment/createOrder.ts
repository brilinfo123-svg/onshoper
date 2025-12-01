// import crypto from "crypto";

// const PAYU_KEY = process.env.PAYU_KEY!;
// const PAYU_SALT = process.env.PAYU_SALT!;

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { amount, category, name, email, contact } = req.body;

//   try {
//     const txnid = "TXN_" + Date.now();
//     const productinfo = `OnShoper Subscription – ${category}`;

//     // ✅ Safe defaults for firstname & email
//     const safeName = name && name.trim() !== "" ? name : "NA";
//     const safeEmail = email && email.trim() !== "" ? email : "NA";

//     // ✅ Ensure amount is string
//     const amountStr = amount.toString();

//     // ✅ Correct hash string
//     const hashString = `${PAYU_KEY}|${txnid}|${amountStr}|${productinfo}|${safeName}|${safeEmail}|||||||||||${PAYU_SALT}`;
//     console.log("Hash String:", hashString); // debug

//     const hash = crypto.createHash("sha512").update(hashString).digest("hex");

//     const payuData = {
//       key: PAYU_KEY,
//       txnid,
//       amount: amountStr,
//       productinfo,
//       firstname: safeName,
//       email: safeEmail,
//       phone: contact,
//       surl: "https://onshoper.com/api/payment/success",
//       furl: "https://onshoper.com/api/payment/failure",
//       hash,
//       service_provider: "payu_paisa",
//     };

//     res.status(200).json({
//       success: true,
//       payuData,
//       payuUrl: "https://test.payu.in/_payment", // use secure.payu.in/_payment for production
//     });
//   } catch (error: any) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// }








import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { amount, category } = req.body;

  try {
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: { category },
    });

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
