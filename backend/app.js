const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");
const cors = require('cors')

const AppError = require("./utils/appError");
const globalErrorhandler = require("./controllers/errorController");
const userRouter = require("./routes/userRoutes");
const timeRequestsRouter = require("./routes/timeRequestRoutes");

const app = express();
// 1 - MIDDLEWARES

//SET SECURITY HTTP HEADERS WITH HELMET
// it is important to be put at the top so that HTTP headers are sure to be set
app.use(helmet());

//Enabling cors
app.use(cors())


//custom middleware functions
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// LIMIT REQUESTS FROM THE SAME API
const limiter = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please trya again in an hour!",
});

app.use("/api", limiter);

// BODY PARSER , READING DATA FROM BODY INTO REQ.BODY
app.use(
  express.json({
    limit: "10kb", // this option limits the size of a body up to 10 kb , larger will not be accepted
  })
);

app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(cookieParser());

// DATA SANITIZATION AGAINST NOSQL QUERY INJECTION
// will filter out $ sign and . from request body and params
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS
// prevents malicious html input
app.use(xss());

//PREVENT PARAMETER POLUTION
// in case of using parameters maliciously
app.use(
  hpp({
    whitelist: [
      "firstName",
      "lastName",
      "employeeType",
      "sickLeaveDays",
      "carryPtoDays",
      "ptoDays",
    ], // whitelist fields which can be duplicated
  })
);

// mounting the routers
app.use("/api/v1/users", userRouter);
app.use("/api/v1/timeRequests", timeRequestsRouter);

//this middleware part will only be reached in case the above route handlers do not handle the request
//this will send an error json object to all requests made to invalid routes
app.all("*", (req, res, next) => {
  //whenever we pass an argument to next it will assume that it is an error and then go to the error handling middleware specified below
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Global error handling middleware
app.use(globalErrorhandler);

module.exports = app;
