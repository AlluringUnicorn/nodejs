const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const { nanoid } = require("nanoid");

const fs = require("fs/promises");
const path = require("path");

const avatarsDir = path.resolve("public", "avatars");

const User = require("../models/user");

const { HttpError } = require("../helpers/HttpError");
const sendEmail = require("../helpers/sendEmail");

require("dotenv").config();

const { SECRET_KEY, BASE_URL } = process.env;

const register = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (user) {
      throw HttpError(409, "Email already in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();

    const avatarURL = await gravatar.url(email);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}"> Click to verify email </a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      email: newUser.email,
      subscription: "starter",
    });
  } catch (error) {
    next(error);
  }
};

const verify = async (req, res, next) => {
  const { verificationToken } = req.params;

  try {
    const user = await User.findOne({ verificationToken });

    if (!user) {
      throw HttpError(404, "User not found");
    }

    await User.findByIdAndUpdate(user._id, {
      verify: true,
      verificationToken: null,
    });

    res.json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

const resendVerify = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      res.json({
        message: "missing required field email",
      });
      throw HttpError(400);
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw HttpError(401);
    }

    if (user.verify) {
      res.json({
        message: "Verification has already been passed",
      });
      throw HttpError(400);
    }

    const verifyEmail = {
      to: email,
      subject: "Verify email",
      html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}"> Click to verify email </a>`,
    };

    await sendEmail(verifyEmail);

    res.json({
      message: "Verification email sent",
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) {
      throw HttpError(404, "User not found");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      throw HttpError(401, "Email or password is wrong");
    }

    const { _id: id } = user;

    const payload = {
      id,
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
    await User.findByIdAndUpdate(id, { token });

    res.json({
      token,
      user: {
        email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const user = req.user;

    res.json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  const { _id } = req.user;

  if (!_id) {
    throw HttpError(401, "Not authorized");
  }

  try {
    await User.findByIdAndUpdate(_id, { token: "" });

    res.status(204).json({
      message: "Logout success",
    });
  } catch (error) {
    next(error);
  }
};

const updateAvatar = async (req, res, next) => {
  const { path: oldPath, filename } = req.file;
  const newPath = path.join(avatarsDir, filename);

  try {
    await fs.rename(oldPath, newPath);
    const avatarURL = path.join("avatars", filename);

    const user = req.user;
    console.log(user.id);

    await User.findByIdAndUpdate(
      user.id,
      { avatarURL: avatarURL },
      {
        new: true,
      }
    );

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verify,
  resendVerify,
  login,
  getCurrent,
  logout,
  updateAvatar,
};
