import connectToDatabase from '@/lib/mongodb';
import multer from 'multer';
import path from 'path';
import LocalShopsModel from '../../models/FormModel';

const storage = multer.diskStorage({
  destination: './public/images', // Directory where files will be saved
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.name + '-' + uniqueSuffix + path.extname(file.originalname)); // Generate unique file name
  },
});
const upload = multer({ storage: storage }).fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'portfolioImages', maxCount: 10 },
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading files', error: err });
    }
    console.log('Uploaded files:', req.files);
    try {
      console.log('Connecting to database...');
      await connectToDatabase();
      console.log('Database connected.');

      const formData = req.body;
      console.log('Form data received:', formData);

      // Validate required fields for the local_shops collection
      const requiredFields = ['category', 'fullName', 'businessName', 'currentAddress'];
      for (const field of requiredFields) {
        if (!formData[field]) {
          console.error(`Missing required field: ${field}`);
          return res.status(400).json({ message: `Missing required field: ${field}` });
        }
      }

      // Sanitize profileImage
      if (formData.profileImage && typeof formData.profileImage !== 'string') {
        formData.profileImage = `/images/${formData.profileImage.filename}`; // Convert to string (file path)
        console.log('Sanitized profileImage:', formData.profileImage);
      }

      // Sanitize portfolioImages
      if (Array.isArray(formData.portfolioImages)) {
        formData.portfolioImages = formData.portfolioImages.map((image) =>
          typeof image === 'string' ? image : `/images/${image.filename}` // Convert to string (file path)
        );
        console.log('Sanitized portfolioImages:', formData.portfolioImages);
      } else {
        formData.portfolioImages = []; // Default to an empty array if invalid
        console.log('portfolioImages set to default:', formData.portfolioImages);
      }
      
      // Save the form data into the local_shops collection
      const shop = await LocalShopsModel.create(formData);
      console.log('Shop data saved:', shop);

      res.status(201).json({ success: true, data: shop });
    } catch (error) {
      console.error('Error saving form:', error);

      if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
          console.error(`Validation error on ${key}: ${error.errors[key].message}`);
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to save form data',
        error: error.message,
      });
    }
  });
}
