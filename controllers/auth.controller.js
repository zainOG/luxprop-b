const JWT = require("jsonwebtoken");
const User = require("../models/User");
const Token = require("../models/Token.model");
const sendEmail = require("../utils/email/sendEmail");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const JWTSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT;
const clientURL = process.env.CLIENT_URL;


const resetPasswordRequestController = async (req, res, next) => {
  const {email} = req.body
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({message: 'Email is not registered'})
  }

  let token = await Token.findOne({ userId: user._id });
  if (token) await token.deleteOne();

  let resetToken = crypto.randomBytes(32).toString("hex");
  const hash = await bcrypt.hash(resetToken, Number(bcryptSalt));

  await new Token({
    userId: user._id,
    token: hash,
    createdAt: Date.now(),
  }).save();

  const link = `${clientURL}/resetPassword/${resetToken}/${user._id}`;

  sendEmail(
    user.email,
    "Password Reset Request",
    {
      name: user.name,
      link: link,
    },
    "./template/requestResetPassword.handlebars"
  );
  return res.status(200).json({ message: `${link}` });
};

const resetPasswordController = async (req, res, next) => {
  const {userId, token, password} = req.body
  console.log(userId, token, password)

  if(!userId||!token) {
    return res.status(400).json({message: 'Missing User ID or token'})
  }

  const passwordResetToken = await Token.findOne({ userId });

  if (!passwordResetToken&&!userId) {
    return res.status(400).json({message: 'Missing Token'})
  }

  console.log(passwordResetToken.token, token);

  const isValid = await bcrypt.compare(token, passwordResetToken.token);

  if (!isValid) {
    return res.status(404).json({message: 'Invalid Token'})
  }

  const hash = await bcrypt.hash(password, Number(bcryptSalt));

  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });

  sendEmail(
    user.email,
    "Password Reset Successfully",
    {
      name: user.name,
    },
    "./template/resetPassword.handlebars"
  );

  await passwordResetToken.deleteOne();

  return res.status(200).json({ message: `Password reset successfull` });
};

module.exports = {
  resetPasswordRequestController,
  resetPasswordController,
};
