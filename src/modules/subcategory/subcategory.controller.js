import slugify from "slugify";
import { Category, Subcategory, Product } from "../../../db/index.js";
import { deleteFile, cloudinary, AppError, messages } from "../../utils/index.js";

// add subcategory
export const addSubcategory = async (req, res, next) => {
  // get data from req
  let { name, category } = req.body;
  name = name.toLowerCase();
  //check file
  if (!req.file) {
    return next(new AppError(messages.file.required, 400));
  }
  // check existence
  const categoryExist = await Category.findById(category);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // check name existence
  const nameExist = await Subcategory.findOne({
    name,
    category,
  });
  if (nameExist) {
    return next(new AppError(messages.subcategory.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);
  const subcategory = new Subcategory({
    name,
    slug,
    category,
    image: { path: req.file.path },
  });
  // add to db
  const createdSubcategory = await subcategory.save();
  if (!createdSubcategory) {
    // todo rollback delete image
    return next(new AppError(messages.subcategory.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.subcategory.createdSuccessfully,
    success: true,
    data: createdSubcategory,
  });
};

// get subcategory
export const getSubcategory = async (req, res, next) => {
  // get data from req
  const { categoryId } = req.params;
  //check existence
  const Subcategories = await Subcategory.find({
    category: categoryId,
  }).populate("category");
  if (!Subcategories.length) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }
  return res.status(200).json({
    success: true,
    data: Subcategories,
  });
};

// update subcategory
export const updateSubcategory = async (req, res, next) => {
  // get data from req
  let { name } = req.body;
  name = name.toLowerCase();
  const { subcategoryId } = req.params;
  //check existence
  const subcategoryExist = await Subcategory.findById(subcategoryId);
  if (!subcategoryExist) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }
  // check existence
  const nameExist = await Subcategory.findOne({
    name,
    _id: { $ne: subcategoryId },
  });
  if (nameExist) {
    return next(new AppError(messages.subcategory.alreadyExist, 409));
  }
  // prepare data
  if (name) {
    subcategoryExist.name = name;
    subcategoryExist.slug = slugify(name);
  }
  // update image
  if (req.file) {
    //delete old image
    deleteFile(subcategoryExist.image.path);
    subcategoryExist.image.path = req.file.path;
    subcategoryExist.markModified("image");
  }
  // update to db
  const updatedSubcategory = await subcategoryExist.save();
  if (!updatedSubcategory) {
    return next(new AppError(messages.subcategory.failToUpdate, 500));
  }
  // send response
  return res.status(200).json({
    message: messages.subcategory.updatedSuccessfully,
    success: true,
    data: updatedSubcategory,
  });
};

// delete subcategory
export const deleteSubcategory = async (req, res, next) => {
  // get data from req
  const { subcategoryId } = req.params;
  //check existence
  const deletedSubcategory = await Subcategory.findByIdAndDelete(subcategoryId);
  if (!deletedSubcategory) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }
  // delete old image
  deleteFile(deletedSubcategory.image.path);
  // send response
  return res.status(200).json({
    message: messages.subcategory.deletedSuccessfully,
    success: true,
    data: deletedSubcategory,
  });
};
