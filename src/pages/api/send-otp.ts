import { NextApiRequest, NextApiResponse } from 'next';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { mobileNumber } = req.body;

    if (!mobileNumber || mobileNumber.length < 10) {
      return res.status(400).json({ error: 'Valid mobile number is required' });
    }

    try {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
      
      const message = await client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: `+91${mobileNumber}`, // Ensure correct phone number format
      });

      return res.status(200).json({ message: 'OTP sent successfully', otp });
    } catch (error: any) {
      console.error('Error sending OTP:', error);
      return res.status(500).json({ error: error.message || 'Failed to send OTP' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
