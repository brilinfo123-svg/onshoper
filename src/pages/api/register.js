import connectDB from '@/lib/mongodb';
import RegistrationModel from '../../models/RegistrationModel';
import bcrypt from "bcrypt";
import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure uploads directory exists
const uploadDir = path.join(process.cwd(), 'public/UserImg');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer to save file to /public/UserImg
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile_${Date.now()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage }).single('profileImage');

export const config = {
  api: {
    bodyParser: false, // Required for multer to work
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Upload the file
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "File upload failed",
        error: err.message,
      });
    }

    try {
      await connectDB();

      const { fullName, email, mobile, password, userId } = req.body;

      // Check if user already exists
      const existingUser = await RegistrationModel.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists with this email.",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Construct image path
      const profileImagePath = req.file ? `/UserImg/${req.file.filename}` : "";

      // Create new user
      const newUser = await RegistrationModel.create({
        fullName,
        email,
        mobile,
        password: hashedPassword,
        profileImage: profileImagePath,
        userId,
      });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred during registration",
        error: error.message,
      });
    }
  });
}
