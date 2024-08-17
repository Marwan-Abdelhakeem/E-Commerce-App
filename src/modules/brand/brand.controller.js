import slugify from "slugify";
import { cloudinary, AppError, messages } from "../../utils/index.js";
import { Brand, Product } from "../../../db/index.js";

// create brand
export const createBrand = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  //check file
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  // check existence
  const brandExist = await Brand.findOne({ name });
  if (brandExist) {
    return next(new AppError(messages.brand.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: "E-commerce/brand" }
  );
  const brand = new Brand({
    name,
    slug,
    logo: { secure_url, public_id },
    // todo createdBy token
  });
  // add to db
  const createdBrand = await brand.save();
  if (!createdBrand) {
    //todo rollback delete logo
    await cloudinary.uploader.destroy(public_id);
    return next(new AppError(messages.brand.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.brand.createdSuccessfully,
    success: true,
    data: createdBrand,
  });
};

// update brand
export const updateBrand = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  const { brandId } = req.params;
  //check existence
  const brandExist = await Brand.findById(brandId);
  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // check name existence
  if (name) {
    const nameExist = await Brand.findOne({
      name,
      _id: { $ne: brandId },
    });
    if (nameExist) {
      return next(new AppError(messages.brand.alreadyExist, 409));
    }
    // prepare data
    brandExist.name = name;
    brandExist.slug = slugify(name);
  }
  // update logo
  if (req.file) {
    // update new logo
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { public_id: brandExist.logo.public_id }
    );
    brandExist.logo = { secure_url, public_id };
  }
  // update to db
  const updatedBrand = await brandExist.save();
  if (!updatedBrand) {
    // rollback delete logo
    await cloudinary.uploader.destroy(brandExist.logo.public_id);
    return next(new AppError(messages.brand.failToUpdate, 500));
  }
  // send response
  return res.status(200).json({
    message: messages.brand.updatedSuccessfully,
    success: true,
    data: updatedBrand,
  });
};
