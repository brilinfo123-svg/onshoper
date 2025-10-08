import { IncomingForm } from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const uploadDir = path.join(process.cwd(), "public", "UserImg");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.on("fileBegin", (name, file) => {
    // Get file extension
    const ext = path.extname(file.originalFilename || "");
    // Generate custom filename with prefix + timestamp + extension
    const fileName = `profile_${Date.now()}${ext}`;
    // Set new filepath
    file.filepath = path.join(uploadDir, fileName);
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const fileArray = Array.isArray(files.file) ? files.file : [files.file];
    const file = fileArray[0];

    if (!file || !file.filepath) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileName = path.basename(file.filepath);
    const publicPath = `/UserImg/${fileName}`;

    return res.status(200).json({ filePath: publicPath });
  });
}