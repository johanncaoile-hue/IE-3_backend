const HttpError = require("../models/http-error");
const User = require("../models/user");

exports.signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch {
    return next(new HttpError("Signup failed, try again later.", 500));
  }

  if (existingUser) {
    return next(new HttpError("Email already registered.", 422));
  }

  const createdUser = new User({
    name,
    email,
    password,
    image: req.file.path,
    places: []
  });

  try {
    await createdUser.save();
  } catch {
    return next(new HttpError("Signup failed, try again.", 500));
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch {
    return next(new HttpError("Login failed.", 500));
  }

  if (!existingUser || existingUser.password !== password) {
    return next(new HttpError("Invalid credentials.", 401));
  }

  res.json({ message: "Logged in!", userId: existingUser.id });
};
