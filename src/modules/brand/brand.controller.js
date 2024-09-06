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
    { folder: `E-commerce/brand` }
  );
  req.uploadedImages = [{ public_id }];
  const brand = new Brand({
    name,
    slug,
    logo: { secure_url, public_id },
    createdBy: req.authUser._id,
  });
  // add to db
  const createdBrand = await brand.save();
  if (!createdBrand) {
    // rollback
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
    req.uploadedImages = [{ public_id }];
    brandExist.logo = { secure_url, public_id };
  }
  // update to db
  const updatedBrand = await brandExist.save();
  if (!updatedBrand) {
    // rollback
    return next(new AppError(messages.brand.failToUpdate, 500));
  }
  // send response
  return res.status(200).json({
    message: messages.brand.updatedSuccessfully,
    success: true,
    data: updatedBrand,
  });
};

// get brands
export const getBrands = async (req, res, next) => {
  //check notFound
  const brands = await Brand.find();
  if (!brands.length) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // send response
  return res.status(200).json({
    success: true,
    data: brands,
  });
};

// get brand
export const getBrand = async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandId).populate("products");
  if (!brand) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // send response
  return res.status(200).json({
    success: true,
    data: brand,
  });
};

// delete brand
export const deleteBrand = async (req, res, next) => {
  // get data from req
  const { brandId } = req.params;
  // check existence
  const deletedBrand = await Brand.findByIdAndDelete(brandId).populate([
    { path: "products", select: "mainImage subImages" },
  ]);
  if (!deletedBrand) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  // prepare ids and image public_ids for deletion
  const productsIds = [];
  const imagesCloud = [];
  imagesCloud.push(deletedBrand.logo.public_id);
  for (const product of deletedBrand.products) {
    productsIds.push(product._id);
    // add main image public_id to the array
    imagesCloud.push(product.mainImage.public_id);
    // add sub images public_ids to the array
    for (const image of product.subImages) {
      imagesCloud.push(image.public_id);
    }
  }
  // delete related products
  await Product.deleteMany({ _id: { $in: productsIds } });
  // delete product images from cloudinary
  for (const public_id of imagesCloud) {
    await cloudinary.uploader.destroy(public_id);
  }
  // send response
  return res.status(200).json({
    message: messages.brand.deletedSuccessfully,
    success: true,
    data: deletedBrand,
  });
};
