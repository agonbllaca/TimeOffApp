const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  //Sending JWT via Cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, //cokie can not be modified by the browser and also send it alongside every requests automatically
  };
  //using https , cookie is created only in https
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);

  //REMOVE PASSWORD FROM OUTPUT
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.createUser = catchAsync(async (req, res, next) => {
  const newUserBody = {
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    employeeType: req.body.employeeType,
    password: req.body.password,
    employeeManager: req.body.employeeManager,
  };

  newUserBody.role = req.user.role === "admin" ? "manager" : "employee";
  if (!newUserBody.employeeManager && req.user.role === "manager") {
    newUserBody.employeeManager = req.user._id;
  }

  const newUser = await User.create(newUserBody); 

  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});

exports.createAdmin = catchAsync(async (req, res, next) => {
  const newUserBody = {
    userName: req.body.userName,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    employeeType: "admin",
    password: req.body.password,
    role: "admin",
  };

  const newUser = await User.create(newUserBody); 

  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      newUser,
    },
  });
});
 
exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  // 1) Check if username and password exist
  if (!userName || !password) {
    return next(new AppError("Please provide username and password!", 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ userName }).select("+password");

  // if there is no user or password is not correct return error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect username or password", 401));
  }
  // 3) If everything is ok , send token to client
  createSendToken(user, 200, res);
});

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: "success" });
};

// SECURITY MIDDLEWARE
exports.protect = catchAsync(async (req, res, next) => {
  // 1) GETTING TOKEN AND CHECK IF IT'S THERE
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer") //it is convention to have the authorization token starting with bearer
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }
  // 2) VERIFICATION TOKEN
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) CHECK IF USER STILL EXISTS or IS DELETED
  const freshUser = await User.findById(decoded.id);

  if (!freshUser) {
    return next(
      new AppError(
        "The user bellonging to this token does no longer exits",
        401
      )
    );
  }
  //    GRANT ACCESS TO PROTECTED ROUTE
  req.user = freshUser;
  next();
});



exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    //roles is an array ['admin','manager','employee'].
    // check if user has the required role , user was provided by the protect middleware and user has role property
    //console.log(roles, !roles.includes(req.user.role), req.user.role, req.user);
    console.log("this is restrict middleware", req.user.role, roles);
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.resetPassword = catchAsync(async (req, res, next) => {
  let user = await User.findById(req.params.id);
  if(!req.body.password){
    return next(
      new AppError("Please provide a new password", 400)
    );
  }

  user.password = req.body.password

  await user.save();
  
  res.status(200).json({ status: "success", data: user});
})