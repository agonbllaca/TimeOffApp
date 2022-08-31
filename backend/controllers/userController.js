const User = require("./../models/userModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./handlerFactory");



exports.resetNextYearDays = catchAsync(async (req, res, next) => {
  console.log("Reset Next Year Days");
  await User.updateMany(
    {},
    [
      { $set: { sickLeaveDays: 20 } },
      {
        $set: {
          carryPtoDays: {
            $switch: {
              branches: [
                { case: { $gte: ["$ptoDays", 11] }, then: 10 },
                { case: { $lte: ["$ptoDays", 10] }, then: "$ptoDays" },
              ],
            },
          },
        },
      }
    ],
    { multi: true }
  );

  await User.updateMany({}, [{ $set: { ptoDays: 20 } }], { multi: true });
});

//Does not update password
exports.updateUser = catchAsync(async (req, res, next) => {
  if(req.body.password){
    delete req.body.password
  }
  const user = await User.findByIdAndUpdate(req.params.id,req.body, {
    new: true,
    runValidators: true,
  })

  if (!user) {
    return next(new AppError(`No document found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
})

// Should not be used to change password as it will not run validators
exports.deleteUser = factory.deleteOne(User);
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
