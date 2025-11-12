import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

const sendSms = async (phone, message) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error("Twilio environment variables are missing");
  }
console.log('jnsfkb')
  const client = require("twilio")(accountSid, authToken);

  await client.messages
    .create({
      body: message,
      from: fromNumber,
      to: `+91${phone}`,
    })
    .then((message) => console.log("SMS sent:", message.sid));
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await dbConnect();

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

  await Otp.findOneAndUpdate(
    { contact },
    { otp, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await sendSms(contact, otp);

  console.log(`OTP for ${contact} is ${otp}`);

  res.status(200).json({ success: true, otp }); // Return OTP for testing only
}








// This is code of FAST2SMS



// import dbConnect from "../../../lib/mongodb";
// import Otp from "@/models/Otp";
// import fetch from "node-fetch";

// // export const dynamic = "force-dynamic"; // Optional for Vercel

// // ✅ Send OTP via Fast2SMS
// const sendSms = async (phone, otp) => {
//   const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY;
//   const FAST2SMS_TEMPLATE_ID = process.env.FAST2SMS_TEMPLATE_ID;

//   try {
//     const payload = {
//       route: "q", // for transactional route (fast delivery)
//       message: `Your OTP for verification is ${otp}`,
//       language: "english",
//       flash: 0,
//       numbers: phone,
//     };

//     const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
//       method: "POST",
//       headers: {
//         "authorization": FAST2SMS_API_KEY,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();
//     console.log("📤 Fast2SMS Response:", data);

//     if (!response.ok || data.return === false) {
//       throw new Error(data.message || "Failed to send OTP");
//     }

//     console.log("✅ SMS sent successfully via Fast2SMS");
//     return data;
//   } catch (error) {
//     console.error("❌ Error sending OTP:", error.message);
//     throw error;
//   }
// };

// // ✅ API Handler
// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   await dbConnect();

//   const { contact } = req.body;

//   if (!contact) {
//     return res.status(400).json({ error: "Contact number required" });
//   }

//   try {
//     // 1️⃣ Generate random 6-digit OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 mins expiry

//     // 2️⃣ Save to MongoDB
//     await Otp.findOneAndUpdate(
//       { contact },
//       { otp, expiresAt },
//       { upsert: true, new: true, setDefaultsOnInsert: true }
//     );

//     // 3️⃣ Send SMS
//     await sendSms(contact, otp);

//     console.log(`✅ OTP for ${contact}: ${otp}`);

//     // 4️⃣ Send success response
//     res.status(200).json({ success: true, message: "OTP sent successfully" });
//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// }
