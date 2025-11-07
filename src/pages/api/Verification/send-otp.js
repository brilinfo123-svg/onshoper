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