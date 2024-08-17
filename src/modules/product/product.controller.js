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
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    {
      folder: "E-commerce/product/mainImages",
    }
  );
  const mainImage = { secure_url, public_id };
  req.failImages = [{ public_id }];
  const subImages = [];
  for (const image of req.files.subImages) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      image.path,
      {
        folder: "E-commerce/product/subImages",
      }
    );
    subImages.push({ secure_url, public_id });
    req.failImages.push({ public_id });
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
    category,
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
  });
  // todo createdBy token
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

// pagination✅ sort✅ select✅ filter✅
export const getAllProducts = async (req, res, next) => {
  const apiFeature = new ApiFeature(Product.find(), req.query)
    .pagination()
    .sort()
    .select()
    .filter();
  const products = await apiFeature.mongooseQuery;
  for (const product of products) {
    delete product.finalPrice;
  }
  return res.status(200).json({
    success: true,
    data: products,
    // metaData: apiFeature.queryData.metaData,
    metaData: {
      ...apiFeature.queryData.metaData,
      size: Object.keys(products).length,
    },
  });

  let { page, size, sort, select, ...filter } = req.query;
  if (!page || page <= 0) {
    page = 1;
  }
  if (!size || size <= 0) {
    size = 3;
  }
  page = parseInt(page);
  size = parseInt(size);
  const skip = (page - 1) * size;
  sort = sort?.replaceAll(",", " ");
  select = select?.replaceAll(",", " ");
  filter = JSON.parse(
    JSON.stringify(filter).replace(/gte|gt|lt|lte/g, (match) => `$${match}`)
  );
  const mongooseQuery = Product.find(filter);
  // mongooseQuery.limit(size).skip(skip);
  mongooseQuery.sort(sort).select(select);
  // const products = await mongooseQuery;

  return res.status(200).json({
    success: true,
    data: products,
    metadata: { page, size, nextPage: page + 1 },
  });
};
