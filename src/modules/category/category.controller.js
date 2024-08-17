import slugify from "slugify";
import { Category, Subcategory, Product } from "../../../db/index.js";
import {
  deleteFile,
  cloudinary,
  AppError,
  messages,
} from "../../utils/index.js";

//add category
export const addCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  //check file
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  // check existence
  const categoryExist = await Category.findOne({ name });
  if (categoryExist) {
    return next(new AppError(messages.category.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);
  const category = new Category({
    name,
    slug,
    image: { path: req.file.path },
  });
  // add to db
  const createdCategory = await category.save();
  if (!createdCategory) {
    // todo rollback delete image
    return next(new AppError(messages.category.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.category.createdSuccessfully,
    success: true,
    data: createdCategory,
  });
};

//update category
export const updateCategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  const { categoryId } = req.params;
  //check existence
  const categoryExist = await Category.findById(categoryId);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // check existence
  const nameExist = await Category.findOne({ name, _id: { $ne: categoryId } });
  if (nameExist) {
    return next(new AppError(messages.category.alreadyExist, 409));
  }
  // prepare data
  if (name) {
    categoryExist.name = name;
    categoryExist.slug = slugify(name);
  }
  // update image
  if (req.file) {
    //delete old image
    deleteFile(categoryExist.image.path);
    categoryExist.image.path = req.file.path;
    categoryExist.markModified("image");
  }
  // update to db
  const updatedCategory = await categoryExist.save();
  if (!updatedCategory) {
    return next(new AppError(messages.category.failToUpdate, 500));
  }
  // send response
  return res.status(200).json({
    message: messages.category.updatedSuccessfully,
    success: true,
    data: updatedCategory,
  });
};

// get categories
export const getCategories = async (req, res, next) => {
  //check notFound
  const categories = await Category.find().populate("subcategories");
  if (!categories.length) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // send response
  return res.status(200).json({
    success: true,
    data: categories,
  });
};

// get category
export const getSpecificCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.categoryId).populate(
    "subcategories"
  );
  if (!category) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // send response
  return res.status(200).json({
    success: true,
    data: category,
  });
};

// delete category
export const deleteCategory = async (req, res, next) => {
  // get data from req
  const { categoryId } = req.params;
  //check existence
  const categoryExist = await Category.findByIdAndDelete(categoryId).populate([
    { path: "subcategories", select: "image" },
    { path: "products", select: "mainImage subImages" },
  ]);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // prepare ids
  const subcategoryIds = [];
  const productsIds = [];
  const imagesPaths = [];
  const imagesCloud = [];
  imagesPaths.push(categoryExist.image.path);
  for (let i = 0; i < categoryExist.subcategories.length; i++) {
    subcategoryIds.push(categoryExist.subcategories[i]._id);
    imagesPaths.push(categoryExist.subcategories[i].image.path);
  }
  for (const product of categoryExist.products) {
    productsIds.push(product._id);
    imagesCloud.push(product.mainImage.public_id);
    product.subImages.forEach((image) => {
      imagesCloud.push(image.public_id);
    });
  }
  // delete related subcategories
  await Subcategory.deleteMany({ _id: { $in: subcategoryIds } });
  // delete related products
  await Product.deleteMany({ _id: { $in: productsIds } });
  // delete images for category subcategory
  for (const path of imagesPaths) {
    deleteFile(path);
  }
  // delete images for products
  for (const public_id of imagesCloud) {
    await cloudinary.uploader.destroy(public_id);
    // note
    // cloudinary.api.delete_resources_by_prefix();
    // cloudinary.api.delete_folder();
  }

  // send response
  return res.status(200).json({
    message: messages.category.deletedSuccessfully,
    success: true,
  });
};
