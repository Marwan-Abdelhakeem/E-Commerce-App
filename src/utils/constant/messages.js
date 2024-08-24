const generateMessage = (entity) => ({
  alreadyExist: `${entity} already exist`, //409
  notFound: `${entity} not found`, //404
  failToCreate: `fail to create ${entity}`, //500
  failToUpdate: `fail to update ${entity}`, //500
  createdSuccessfully: `${entity} created Successfully`, //201
  updatedSuccessfully: `${entity} updated Successfully`, //200
  deletedSuccessfully: `${entity} deleted Successfully`, //200
  notAllowed: `${entity} not authorized to access this api`, //401
  verifiedSuccessfully: `${entity} verified successfully`, //200
});
export const messages = {
  category: generateMessage("category"),
  subcategory: generateMessage("subcategory"),
  brand: generateMessage("brand"),
  product: generateMessage("product"),
  review: generateMessage("review"),
  file: { required: "file is required" }, //400
  user: generateMessage("user"),
  cart: generateMessage("cart"),
  coupon: generateMessage("coupon"),
  order: generateMessage("order"),
};
