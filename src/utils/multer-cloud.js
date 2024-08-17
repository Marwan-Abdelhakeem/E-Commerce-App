import multer, { diskStorage } from "multer";
import { fileValidation } from "./constant/fileValidation.js";

export const cloudUpload = ({ allowFile = fileValidation.image }) => {
  const storage = diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (allowFile.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("invalid file format"));
  };
  return multer({ storage, fileFilter });
};
