import cloudinary from "./cloudinary.js";

export const deleteCloud = async (uploadedImages) => {
  for (const image of uploadedImages) {
    await cloudinary.uploader.destroy(image.public_id);
  }
};
