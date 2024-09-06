import slugify from "slugify";
import { Category, Subcategory, Product } from "../../../db/index.js";
import { cloudinary, AppError, messages } from "../../utils/index.js";

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
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `E-commerce/${name}` }
  );
  req.uploadedImages = [{ public_id }];
  const category = new Category({
    name,
    slug,
    image: { secure_url, public_id },
    createdBy: req.authUser._id,
  });
  // add to db
  const createdCategory = await category.save();
  if (!createdCategory) {
    // rollback
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
  const { categoryId } = req.params;
  //check existence
  const categoryExist = await Category.findById(categoryId);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // prepare data
  if (name) {
    // check existence
    name = name.toLowerCase();
    const nameExist = await Category.findOne({
      name,
      _id: { $ne: categoryId },
    });
    if (nameExist) {
      return next(new AppError(messages.category.alreadyExist, 409));
    }
    categoryExist.name = name;
    categoryExist.slug = slugify(name);
  }
  // update image
  if (req.file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: categoryExist.image.public_id,
      }
    );
    req.uploadedImages = [{ public_id }];
    categoryExist.image = { secure_url, public_id };
  }
  // update to db
  const updatedCategory = await categoryExist.save();
  if (!updatedCategory) {
    // rollback
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
    { path: "subcategories", select: "_id" },
    { path: "products", select: "_id" },
  ]);
  if (!categoryExist) {
    return next(new AppError(messages.category.notFound, 404));
  }
  // prepare ids
  const subcategoryIds = [];
  const productsIds = [];
  for (const subcategory of categoryExist.subcategories) {
    subcategoryIds.push(subcategory._id);
  }
  for (const product of categoryExist.products) {
    productsIds.push(product._id);
  }
  // delete related subcategories
  await Subcategory.deleteMany({ _id: { $in: subcategoryIds } });
  // delete related products
  await Product.deleteMany({ _id: { $in: productsIds } });

  // delete images for category subcategory product
  const folderPath = `E-commerce/${categoryExist.name}`;
  await cloudinary.api.delete_resources_by_prefix(folderPath);
  await cloudinary.api.delete_folder(folderPath);
  // send response
  return res.status(200).json({
    message: messages.category.deletedSuccessfully,
    success: true,
  });
};
