import dbConnect from "../../../lib/mongodb";
import Otp from "@/models/Otp";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  await dbConnect();

  const { contact } = req.body;

  if (!contact) {
    return res.status(400).json({ error: "Contact required" });
  }

  // ✅ Normalize contact number → always 10 digits
  let normalizedContact = contact.toString().trim().replace(/\D/g, "");
  if (normalizedContact.length > 10) {
    normalizedContact = normalizedContact.slice(-10);
  }

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  // ✅ Save OTP in DB
  await Otp.findOneAndUpdate(
    { contact: normalizedContact },
    { otp, expiresAt },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // ✅ Send OTP via AiSensy WhatsApp API
  try {
    const payload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: "verify_code",
      destination: "91" + normalizedContact,   // 👈 AiSensy needs 91 prefix for sending
      userName: "Send_Verification",
      templateParams: [otp],
      source: "new-landing-page form",
      media: {},
      buttons: [],
      carouselCards: [],
      location: {},
      attributes: {},
      paramsFallbackValue: { FirstName: "user" }
    };

    console.log("Sending OTP payload:", payload);

    const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AISENSY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("AiSensy response:", data);

    if (data.message && data.message.includes("Invalid")) {
      return res.status(400).json({ success: false, error: data.message });
    }
  } catch (error) {
    console.error("AiSensy error:", error);
    return res.status(500).json({ success: false, error: "Failed to send OTP via AiSensy" });
  }

  res.status(200).json({ success: true, otp });
}






// import dbConnect from "../../../lib/mongodb";
// import Otp from "@/models/Otp";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   await dbConnect();

//   const { contact } = req.body;

//   if (!contact) {
//     return res.status(400).json({ error: "Contact required" });
//   }

//   // ✅ Normalize contact number (remove +, spaces, ensure starts with 91)
//   let normalizedContact = contact.toString().trim().replace(/\D/g, "");
//   if (!normalizedContact.startsWith("91")) {
//     normalizedContact = "91" + normalizedContact;
//   }

//   // ✅ Generate OTP
//   const otp = Math.floor(100000 + Math.random() * 900000).toString(); // random 6-digit
//   const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

//   await Otp.findOneAndUpdate(
//     { contact: normalizedContact },
//     { otp, expiresAt },
//     { upsert: true, new: true, setDefaultsOnInsert: true }
//   );

//   // ✅ Send OTP via AiSensy WhatsApp API
//   try {
//     const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${process.env.AISENSY_API_KEY}`, // 👈 store API key in .env
//       },
//       body: JSON.stringify({
//         apiKey: process.env.AISENSY_API_KEY,
//         campaignName: "verify_code",        // 👈 your live campaign
//         destination: normalizedContact,     // 👈 91XXXXXXXXXX format
//         userName: "Send_Verification",      // 👈 template name
//         templateParams: [otp],              // 👈 OTP inject
//         source: "new-landing-page form",    // 👈 source identifier
//         media: {},
//         buttons: [
//           {
//             type: "button",
//             sub_type: "url",
//             index: 0,
//             parameters: [
//               {
//                 type: "text",
//                 text: "TESTCODE20"          // 👈 optional button param
//               }
//             ]
//           }
//         ],
//         carouselCards: [],
//         location: {},
//         attributes: {},
//         paramsFallbackValue: {
//           FirstName: "user"                 // 👈 fallback param
//         }
//       }),
//     });

//     const data = await response.json();
//     console.log("AiSensy response:", data);
//   } catch (error) {
//     console.error("AiSensy error:", error);
//   }

//   res.status(200).json({ success: true, otp });
// }









// import dbConnect from "../../../lib/mongodb";
// import Otp from "@/models/Otp";

// // ❌ Twilio SMS skip for now
// // const sendSms = async (phone, message) => { ... }

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   await dbConnect();

//   const { contact } = req.body;

//   if (!contact) {
//     return res.status(400).json({ error: "Contact required" });
//   }

//   // ✅ Static OTP for testing
//   const otp = "123456";
//   const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

//   await Otp.findOneAndUpdate(
//     { contact },
//     { otp, expiresAt },
//     { upsert: true, new: true, setDefaultsOnInsert: true }
//   );

//   // ❌ Skip Twilio SMS for now
//   // await sendSms(contact, otp);

//   console.log(`Static OTP for ${contact} is ${otp}`);

//   // ✅ Return OTP in response (frontend can alert it)
//   res.status(200).json({ success: true, otp });
// }






// import dbConnect from "../../../lib/mongodb";
// import Otp from "@/models/Otp";

// const sendSms = async (phone, message) => {
//   const accountSid = process.env.TWILIO_ACCOUNT_SID;
//   const authToken = process.env.TWILIO_AUTH_TOKEN;
//   const fromNumber = process.env.TWILIO_PHONE_NUMBER;

//   if (!accountSid || !authToken || !fromNumber) {
//     throw new Error("Twilio environment variables are missing");
//   }
//   const client = require("twilio")(accountSid, authToken);

//   await client.messages
//     .create({
//       body: message,
//       from: fromNumber,
//       to: `+91${phone}`,
//     })
//     .then((message) => console.log("SMS sent:", message.sid));
// };

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   await dbConnect();

//   const { contact } = req.body;

//   if (!contact) {
//     return res.status(400).json({ error: "Contact required" });
//   }

//   const otp = Math.floor(100000 + Math.random() * 900000).toString();
//   const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

//   await Otp.findOneAndUpdate(
//     { contact },
//     { otp, expiresAt },
//     { upsert: true, new: true, setDefaultsOnInsert: true }
//   );

//   await sendSms(contact, otp);

//   console.log(`OTP for ${contact} is ${otp}`);

//   res.status(200).json({ success: true, otp }); // Return OTP for testing only
// }








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
