import slugify from "slugify";
import { Category, Subcategory, Product } from "../../../db/index.js";
import { cloudinary, AppError, messages } from "../../utils/index.js";

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
  const subcategoryExist = await Subcategory.findOne({
    name,
    category,
  });
  if (subcategoryExist) {
    return next(new AppError(messages.subcategory.alreadyExist, 409));
  }
  // prepare data
  const slug = slugify(name);
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: `E-commerce/${categoryExist.name}/${name}`,
    }
  );
  req.uploadedImages = [{ public_id }];
  const subcategory = new Subcategory({
    name,
    slug,
    category,
    image: { secure_url, public_id },
    createdBy: req.authUser._id,
  });
  // add to db
  const createdSubcategory = await subcategory.save();
  if (!createdSubcategory) {
    // rollback
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
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      {
        public_id: subcategoryExist.image.public_id,
      }
    );
    req.uploadedImages = [{ public_id }];
    subcategoryExist.image = { secure_url, public_id };
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
  const subcategoryExist = await Subcategory.findByIdAndDelete(
    subcategoryId
  ).populate([
    { path: "categories", select: "name" },
    { path: "products", select: "_id" },
  ]);
  if (!subcategoryExist) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }
  // prepare ids
  const productsIds = [];
  for (const product of subcategoryExist.products) {
    productsIds.push(product._id);
  }
  // delete related products
  await Product.deleteMany({ _id: { $in: productsIds } });
  // delete images for category subcategory product
  const folderPath = `E-commerce/${subcategoryExist.categories[0].name}/${subcategoryExist.name}`;
  await cloudinary.api.delete_resources_by_prefix(folderPath);
  await cloudinary.api.delete_folder(folderPath);
  // send response
  return res.status(200).json({
    message: messages.subcategory.deletedSuccessfully,
    success: true,
    data: subcategoryExist,
  });
};
