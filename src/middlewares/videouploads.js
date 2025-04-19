import multer from "multer";
import path from 'path'
import fs from 'fs'
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from "url";
import { dirname } from "path";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



// multer configuration for video uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
  
const fileFilter = (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only MP4, WEBM, and OGG video files are allowed.'), false);
    }
};
  
export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

// Video-upload service
export const uploadVideoToDummy = async (filePath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
  
    try {
      const response = await axios.post(`${process.env.STORAGE_ZONE_URL}/upload`, form, {
        headers: {
          ...form.getHeaders(),
          'AccessKey': process.env.API_KEY,
        },
      });
      
      // Clean up temporary file
      fs.unlinkSync(filePath);
      
      return response.data;
    } catch (error) {
      // Cleaning up the temporary file even if upload fails
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
};