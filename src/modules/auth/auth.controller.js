import { Cart, User } from "../../../db/index.js";
import {
  AppError,
  messages,
  status,
  sendEmail,
  generateToken,
  verifyToken,
  comparePassword,
  hashPassword,
  verifyEmailTemplate,
  tempPassEmailTemplate,
  generateTempPassword,
  cloudinary,
  roles,
} from "../../utils/index.js";

export const signup = async (req, res, next) => {
  // get data from req
  const { userName, phone, email, password, DOB } = req.body;
  // check existence
  const userExist = await User.findOne({ $or: [{ email }, { phone }] });
  if (userExist) {
    return next(new AppError(messages.user.alreadyExist, 409));
  }
  // prepare data
  let { role } = req.body;
  if (role) {
    role = roles[role.toUpperCase()];
  } else {
    role = roles.USER;
  }
  // hash password
  const hashedPassword = hashPassword({ password });
  const user = new User({
    userName,
    email,
    phone,
    password: hashedPassword,
    DOB,
    role,
  });
  // generate token
  const token = generateToken({ payload: { email } });
  // add to db

  const createdUser = await user.save();

  if (!createdUser) {
    return next(new AppError(messages.user.failToCreate, 500));
  }
  // send email
  await sendEmail({
    to: email,
    subject: "verify your account",
    html: verifyEmailTemplate({ userName, req, token }),
  });
  return res.status(201).json({
    message: `${messages.user.createdSuccessfully}, Please check your email to verify your account.`,
    success: true,
    data: createdUser,
  });
};

export const verifyAccount = async (req, res, next) => {
  // get data from req
  const { token } = req.query;
  // verify token
  const payload = verifyToken({ token });
  const user = await User.findOneAndUpdate(
    { email: payload.email, status: status.PENDING },
    { status: status.VERIFIED },
    { new: true }
  );
  if (!user) {
    return next(new AppError("invalid credential", 401));
  }
  await Cart.create({ user: user._id, products: [] });
  return res.status(200).json({
    message: messages.user.verifiedSuccessfully,
    success: true,
  });
};

export const login = async (req, res, next) => {
  const { email, phone, password } = req.body;
  const userExist = await User.findOneAndUpdate(
    {
      $or: [{ email }, { phone }],
      status: status.VERIFIED,
    },
    { active: true }
  );
  if (!userExist) {
    return next(new AppError("invalid credential", 401));
  }
  // check password
  const isMach = comparePassword({
    password,
    hashPassword: userExist.password,
  });
  if (!isMach) {
    return next(new AppError("invalid credential", 401));
  }
  // generate token
  const token = generateToken({
    payload: { email },
    secretKey: process.env.secretKeyAccessToken,
    expiresIn: "30d",
  });

  return res
    .status(200)
    .json({ message: "welcome", success: true, accessToken: token });
};

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  // prepare data
  // generate temporary password
  const tempPassword = generateTempPassword(8);
  // hash password
  const hashedPassword = hashPassword({ password: tempPassword });
  const userExist = await User.findOneAndUpdate(
    {
      email,
      status: status.VERIFIED,
    },
    { password: hashedPassword }
  );
  if (!userExist) {
    return next(new AppError("invalid credential", 401));
  }
  // send email
  await sendEmail({
    to: email,
    subject: "reset password",
    html: tempPassEmailTemplate({
      userName: userExist.userName,
      tempPassword,
    }),
  });
  return res.status(200).json({
    message: "Please check your email to reset password",
    success: true,
  });
};

export const logout = async (req, res, next) => {
  // delete token from localStorage
  await User.findByIdAndUpdate({ _id: req.authUser._id }, { active: false });
  return res
    .status(200)
    .json({ message: "Logged out successfully", success: true });
};

export const updateAccount = async (req, res, next) => {
  // get data from req
  const { userName, phone, password, DOB } = req.body;
  // check existence
  const user = await User.findById(req.authUser._id);

  // prepare data
  if (userName) {
    user.userName = userName;
  }
  if (phone) {
    const phoneExist = await User.findOne({ phone, _id: { $ne: user._id } });
    if (phoneExist) {
      return next(new AppError(messages.user.alreadyExist, 409));
    }
    user.phone = phone;
  }
  if (password) {
    user.password = hashPassword({ password });
  }
  if (DOB) {
    user.DOB = DOB;
  }
  // update image
  if (req.file) {
    let secure_url, public_id;
    if (user.image.public_id === "user_rhqrfo") {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "E-commerce/user",
      });
      secure_url = result.secure_url;
      public_id = result.public_id;
      req.uploadedImages = [{ public_id }];
    } else {
      const result = await cloudinary.uploader.upload(req.file.path, {
        public_id: user.image.public_id,
      });
      secure_url = result.secure_url;
      public_id = result.public_id;
      req.uploadedImages = [{ public_id }];
    }
    user.image = { secure_url, public_id };
  }
  // update to db
  const updatedUser = await user.save();
  if (!updatedUser) {
    // rollback
    return next(new AppError(messages.user.failToUpdate, 500));
  }
  // send response
  return res.status(200).json({
    message: messages.user.updatedSuccessfully,
    success: true,
    data: updatedUser,
  });
};
