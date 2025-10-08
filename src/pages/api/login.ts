import type { NextApiRequest, NextApiResponse } from "next";
import connectToDatabase from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import mongoose, { Model } from "mongoose";


interface User {
  email: string;
  password: string;
}

const UserSchema = new mongoose.Schema<User>({
  email: { type: String, required: true },
  password: { type: String, required: true },
});

// Check if the model already exists or create it
const RegistrationModel: Model<User> =
  mongoose.models.registrations || mongoose.model<User>("registrations", UserSchema);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  try {
    // Connect to the database
    await connectToDatabase();

    // Check if the user exists in the "registrations" collection
    const user = await RegistrationModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    return res.status(200).json({ message: "Login successful", user: { email: user.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
