import { NextApiRequest, NextApiResponse } from 'next';
import multer from 'multer';
import { NextApiHandler } from 'next';
import path from 'path';
import fs from 'fs';

// Configure multer with type definitions
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(process.cwd(), 'public/uploads');
      // Ensure the uploads directory exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },
  }),
});

// Middleware for single file upload
const uploadMiddleware = upload.single('file');

// Helper to wrap middleware for Next.js
const runMiddleware = (req: NextApiRequest, res: NextApiResponse, fn: Function) => {
  return new Promise<void>((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve();
    });
  });
};

const handler: NextApiHandler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Run multer middleware
    await runMiddleware(req, res, uploadMiddleware);

    // Access the uploaded file
    const file = (req as any).file; // Multer adds the file object to the request

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({
      message: 'File uploaded successfully',
      filePath: `/uploads/${file.filename}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default handler;

// Disable body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};
