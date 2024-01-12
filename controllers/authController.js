const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const User = require("../Models/userModal");
const { promisify } = require("util");

const util = require("util");
const catchAsync = require("../utils/catchAsync");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

exports.signup = async (req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  console.log(req.body);

  try {
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      phoneNumber: req.body.phoneNumber,
      pushToken: req.body.pushToken,
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: "success",
      token,
      data: {
        user: newUser,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email })
    .select("+password")
    .select(+"status");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  } else if (user && (await user.correctPassword(password, user.password))) {
    if (user.status === "Deactive") {
      return next(
        new AppError("Unable to log in User Status is Deactive", 401)
      );
    }
  }
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    user,
  });
};
exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }
  const user = await User.findOne({ email })
    .select("+password")
    .select(+"status")
    .select(+"role");
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  } else if (user && (await user.correctPassword(password, user.password))) {
    if (user.status === "Deactive") {
      return next(
        new AppError("Unable to log in Admin Status is Deactive", 401)
      );
    } else if (user.status === "Active") {
      const role = user.role;
      const token = signToken(user._id);
      res.status(200).json({
        status: "success",
        role,
        token,
      });
      return;
    }
  }
};
exports.protect = catchAsync(async (req, res, next) => {
  console.log(first);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      res.status(400).json({
        status: "fail",
        msg: "you are not logged in please login ",
      })
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      res.status(400).json({
        status: "fail",
        msg: "The user belonging to this token does no longer exist. ",
      })
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    res.status(400).json({
      status: "fail",
      msg: "User recently changed the password! Please log in again. ",
    });
  }

  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.countUsers = async (req, res) => {
  try {
    const query = { status: "Active" };
    const severityCount = await Plant.countDocuments({ severity: { $gt: 15 } });
    const totalUsers = await User.countDocuments({});
    const activeUsers = await User.countDocuments(query);
    const totalPlants = await Plant.countDocuments({});
    const deactiveUsers = totalUsers - activeUsers;
    res.status(200).json({
      status: "success",
      totalUsers,
      activeUsers,
      deactiveUsers,
      totalPlants,
      severityCount,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
