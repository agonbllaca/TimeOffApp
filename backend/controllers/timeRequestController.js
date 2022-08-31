const Request = require("./../models/timeRequestModel");
const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");
const { Parser } = require("json2csv");

const availableDays = function(userObject, requestType) {
  let days;
  if (requestType === "PTO")
    days = userObject.carryPtoDays + userObject.ptoDays;
  if (requestType === "SickLeave") 
    days = userObject.sickLeaveDays;
  return days;
};

function getBusinessDatesCount(startDate, endDate) {
  let count = 0;
  const curDate = new Date(startDate.getTime());
  while (curDate <= endDate) {
    const dayOfWeek = curDate.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    curDate.setDate(curDate.getDate() + 1);
  }
  return count;
}

exports.createRequest = catchAsync(async (req, res, next) => {
  const reqBody = {
    startDate: new Date(Date.parse(req.body.startDate)),
    endDate: new Date(Date.parse(req.body.endDate)),
    requestType: req.body.requestType,
    userId: req.body.userId,
  };

  if(reqBody.startDate >= reqBody.endDate){
    return next(
      new AppError("The start date should be a date before the end date", 400)
    );
  }

  if(reqBody.startDate < new Date()){
    return next(
      new AppError("The start date should be a date that is yet to come", 400)
    );
  }

  reqBody.days = getBusinessDatesCount(reqBody.startDate, reqBody.endDate);

  if (!req.body.userId) {
    reqBody.userId = req.user._id;
  } else {
    reqBody.userId = req.body.userId;
  }
  let userObj = await User.findById(reqBody.userId);

  if (reqBody.days > availableDays(userObj, reqBody.requestType)) {
    return next(
      new AppError("You have exceeded the number of your available days", 400)
    );
  }

  const newRequest = await Request.create(reqBody);

  res.status(200).json({
    status: "success",
    data: {
      data: newRequest,
    },
  });
});

exports.approveRequest = catchAsync(async (req, res, next) => {
  const { userId, canceled, days, requestType } = await Request.findById(
    req.params.id
  );
  const userObj = await User.findById(userId);

  // Throw error if you are not the employee manager
  if (req.user._id !== userObj.employeeManager) {
    return next(
      new AppError("You are not authorized to approve this request", 403)
    );
  } // Throw error if request is cancelled
  if (canceled) {
    return next(new AppError("Request is already cancelled", 403));
  }

  const approvedRequest = await Request.findByIdAndUpdate(req.params.id, {
    approved: true,
  });

  const updateBody = {};
  if (requestType === "PTO" && days <= availableDays(userObj, requestType)) {
    if (days <= userObj.carryPtoDays) {
      updateBody.carryPtoDays = userObj.carryPtoDays - days;
    } else if (days > userObj.carryPtoDays) {
      updateBody.carryPtoDays = 0;
      updateBody.ptoDays = availableDays(userObj, requestType) - days;
    }
  } else if (
    requestType === "SickLeave" &&
    days <= availableDays(userObj, requestType)
  ) {
    updateBody.sickLeaveDays = userObj.sickLeaveDays - days;
  } else {
    return next(new AppError(`Exceeded available ${requestType} days`, 400));
  }
  const updatedUser = await User.findByIdAndUpdate(userId, updateBody);

  res.status(200).json({
    status: "success",
    data: {
      data: { request: approvedRequest, user: updatedUser },
    },
  });
});

exports.denyRequest = catchAsync(async (req, res, next) => {
  const { userId, approved } = await Request.findById(req.params.id);
  const { employeeManager } = await User.findById(userId);

  if (req.user._id !== employeeManager) {
    return next(
      new AppError("You are not authorized to cancel this request", 403)
    );
  }
  if (approved) {
    return next(new AppError("Request is already approved", 400));
  }

  const approvedRequest = await Request.findByIdAndUpdate(req.params.id, {
    canceled: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      data: approvedRequest,
    },
  });
});

const fields = [
  {
    label: "RequestId",
    value: "_id",
  },
  {
    label: "UserId",
    value: "id",
  },
  {
    label: "Request Type",
    value: "requestType",
  },
  {
    label: "Start Date",
    value: "startDate",
  },
  {
    label: "End Date",
    value: "endDate",
  },
  {
    label: "Total PTO Days",
    value: "days",
  },
  {
    label: "Approved",
    value: "approved",
  },
  {
    label: "Denied",
    value: "canceled",
  },
];

exports.getRequestReport = catchAsync(async (req, res, next) => {
  let reqUserId = !req.params.userId? req.user._id:req.params.userId;

  let user = await User.findById(reqUserId);

  userArray = user.map((item) => item._id);
  const docs = await Request.find({ userId: { $in: userArray } });
  const json2csv = new Parser({ fields: fields });
  csv = json2csv.parse(docs);
  res.attachment(`${user.firstName}_TimeOffReport.csv`);
  res.status(200).send(csv);
});

exports.getEmployeeRequestReport = catchAsync(async (req, res, next) => {
 
   let user = await User.findById(req.params.userId);

   if(req.user._id !== user.employeeManager){
    return next(
      new AppError("You are not the employee manager", 403)
    );
   }

  userArray = user.map((item) => item._id);
  const docs = await Request.find({ userId: { $in: userArray } });
  const json2csv = new Parser({ fields: fields });
  csv = json2csv.parse(docs);
  res.attachment(`${user.firstName}_TimeOffReport.csv`);
  res.status(200).send(csv);
});

exports.getAllRequests = factory.getAll(Request);
exports.getRequest = factory.getOne(Request);
