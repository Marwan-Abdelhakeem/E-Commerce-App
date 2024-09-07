import slugify from "slugify";
import { Subcategory, Brand, Product } from "../../../db/index.js";
import {
  cloudinary,
  AppError,
  messages,
  ApiFeature,
} from "../../utils/index.js";

// add product
export const addProduct = async (req, res, next) => {
  // get data from req
  const {
    name,
    description,
    category,
    subcategory,
    brand,
    price,
    discount,
    stock,
    rate,
  } = req.body;

  let { colors, size } = req.body;
  // check existence
  const brandExist = await Brand.findById(brand);
  if (!brandExist) {
    return next(new AppError(messages.brand.notFound, 404));
  }
  const subcategoryExist = await Subcategory.findById(subcategory);
  if (!subcategoryExist) {
    return next(new AppError(messages.subcategory.notFound, 404));
  }
  //check file;
  if (Object.keys(req.files).length != 2) {
    return next(new AppError(messages.file.required, 400));
  }
  // uploads
  // req.files >>> {mainImage:[{}], subImages:[{},{}]}

  const publicId = subcategoryExist.image.public_id;
  const parts = publicId.split("/");
  const folderPath = parts.slice(0, 3).join("/");

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: `${folderPath}/product/mainImages`,
    }
  );
  const mainImage = { secure_url, public_id };
  req.uploadedImages = [{ public_id }];
  const subImages = [];
  for (const image of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      image.path,
      {
        folder: `${folderPath}/product/subImages`,
      }
    );
    subImages.push({ secure_url, public_id });
    req.uploadedImages.push({ public_id });
  }
  if (colors) {
    colors = JSON.parse(colors);
  }
  if (size) {
    size = JSON.parse(size);
  }
  // add to db
  const product = new Product({
    name,
    slug: slugify(name),
    description,
    category: subcategoryExist.category,
    subcategory,
    brand,
    price,
    discount,
    colors,
    size,
    stock,
    rate,
    mainImage,
    subImages,
    createdBy: req.authUser._id,
    updatedBy: req.authUser._id,
  });
  const createdProduct = await product.save();
  if (!createdProduct) {
    // rollback
    return next(new AppError(messages.product.failToCreate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.product.createdSuccessfully,
    success: true,
    data: createdProduct,
  });
};
export const updateProduct = async (req, res, next) => {
  // get product id from request params
  const { productId } = req.params;
  // get data from req
  const {
    category,
    subcategory,
    brand,
    name,
    description,
    price,
    discount,
    stock,
  } = req.body;
  let { colors, size } = req.body;
  //check existence
  const productExist = await Product.findById(productId);
  if (!productExist) {
    return next(new AppError(messages.product.notFound, 404));
  }
  // check existence of related entities
  if (subcategory) {
    const subcategoryExist = await Subcategory.findById(subcategory);
    if (!subcategoryExist) {
      return next(new AppError(messages.subcategory.notFound, 404));
    }
    if (subcategoryExist.category != category) {
      return next(
        new AppError(
          "The selected subcategory does not belong to the specified category.",
          400
        )
      );
    }
    productExist.subcategory = subcategory;
    productExist.category = subcategoryExist.category;
  }
  if (brand) {
    const brandExist = await Brand.findById(brand);
    if (!brandExist) {
      return next(new AppError(messages.brand.notFound, 404));
    }
    productExist.brand = brand;
  }

  if (colors) {
    productExist.colors = JSON.parse(colors);
  }
  if (size) {
    productExist.size = JSON.parse(size);
  }
  if (name) {
    productExist.name = name;
    productExist.slug = slugify(name);
  }
  if (description) {
    productExist.description = description;
  }
  if (stock) {
    productExist.stock = stock;
  }
  if (price) {
    productExist.price = price;
  }
  if (discount) {
    productExist.discount = discount;
  }
  // uploads
  // req.files >>> {mainImage:[{}], subImages:[{},{}]}
  if (req.files?.mainImage?.length > 0) {
    // update new images
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.files.mainImage[0].path,
      { public_id: productExist.mainImage.public_id }
    );
    req.uploadedImages = [{ public_id }];
    productExist.mainImage = { secure_url, public_id };
  }
  if (req.files?.subImages?.length > 0) {
    // delete old images
    for (const image of productExist.subImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }
    // update new images
    const subImages = [];
    req.uploadedImages = req.uploadedImages || [];
    const publicId = productExist.subImages[0].public_id;
    const parts = publicId.split("/");
    const folderPath = parts.slice(0, 5).join("/");
    for (const image of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        image.path,
        {
          folder: `${folderPath}`,
        }
      );
      subImages.push({ secure_url, public_id });
      req.uploadedImages.push({ public_id });
    }
    productExist.subImages = subImages;
  }
  productExist.updatedBy = req.authUser._id;
  // update to db
  const updatedProduct = await productExist.save();
  if (!updatedProduct) {
    // rollback
    return next(new AppError(messages.product.failToUpdate, 500));
  }
  // send response
  return res.status(201).json({
    message: messages.product.updatedSuccessfully,
    success: true,
    data: updatedProduct,
  });
};
export const deleteProduct = async (req, res, next) => {
  // get product id from request params
  const { productId } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(productId);
  if (!deletedProduct) {
    return next(new AppError(messages.product.notFound, 404));
  }
  // prepare image public_ids for deletion
  const imagesCloud = [];
  // add main image public_id to the array
  imagesCloud.push(deletedProduct.mainImage.public_id);
  // add sub images public_ids to the array
  for (const image of deletedProduct.subImages) {
    imagesCloud.push(image.public_id);
  }
  // delete product images from cloudinary
  for (const public_id of imagesCloud) {
    await cloudinary.uploader.destroy(public_id);
  }
  // send response
  return res.status(201).json({
    message: messages.product.updatedSuccessfully,
    success: true,
    data: deletedProduct,
  });
};
// pagination✅ sort✅ select✅ filter✅
export const getAllProducts = async (req, res, next) => {
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const products = await apiFeature.mongooseQuery.lean();
  const totalResults = await Product.countDocuments(
    apiFeature.queryData.filter
  );
  const totalPages = Math.ceil(totalResults / apiFeature.metaData.size);
  return res.status(200).json({
    success: true,
    data: products,
    metaData: {
      ...apiFeature.metaData,
      totalResults,
      totalPages,
    },
  });
};
