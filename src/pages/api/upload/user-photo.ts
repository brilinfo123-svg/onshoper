import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req, res) {
  upload.single('file')(req, res, function (err) {
    if (err) return res.status(500).json({ error: err.message });

    const stream = cloudinary.uploader.upload_stream(
      { folder: 'user-profile-photos' }, // optional folder in Cloudinary
      (error, result) => {
        if (error) return res.status(500).json({ error });
        res.status(200).json({ filePath: result.secure_url });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(stream);
  });
}
