import multer from "multer";
import { allowedExtensions } from "./allowedExtensions.js";
export const multerCloudFunction = allowedExtensionsArr => {
  if (!allowedExtensionsArr) {
    allowedExtensionsArr = allowedExtensions.image;
  }
  const storage = multer.diskStorage({});
  const fileFilter = function (req, file, cb) {
    if (allowedExtensionsArr.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error('invalid extension', {
      cause: 400
    }), false);
  };
  const fileUpload = multer({
    fileFilter,
    storage
  });
  return fileUpload;
};