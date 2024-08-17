import fs from "fs";
import path from "path";
import cloudinary from "./cloudinary.js";

export const deleteFile = (filePath) => {
  let fullPath = path.resolve(filePath);
  fs.unlinkSync(fullPath);
};

export const deleteCloud = async (failImages) => {
  for (const image of failImages) {
    await cloudinary.uploader.destroy(image.public_id);
  }
};
