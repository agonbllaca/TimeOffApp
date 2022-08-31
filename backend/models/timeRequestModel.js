const mongoose = require("mongoose");

//userid , From (date), days(int) , to (autocalc based on days), requesttype[PTO,SickLeave] , approved[boolean 0,1]
const timeRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    startDate: {
      type: Date,
      required: [true, "A time off request needs to have a starting date"],
    },
    days: {
      type: Number,
      //required: [true, "A time off request must have the number of days"],
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} is not an integer value",
      },
      min: 0,
      max: 30,
    },
    endDate: {
      type: Date,
      required: [true, "A time off request must have an end date"],
    },
    requestType: {
      type: String,
      enum: ["PTO", "SickLeave"],
      default: "PTO",
    },
    approved: {
      type: Boolean,
      required: true,
      default: false,
    },
    canceled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

timeRequestSchema.virtual("userData", {
  ref: "User",
  foreignField: "_id", //  field in reviewModel ( in relational db model this could be a constraint that points to a column in another table)
  localField: "userId", // local field that references the field in the review model (in rdb model this could be primary key)
});

const Request = mongoose.model("Request", timeRequestSchema);
module.exports = Request;
