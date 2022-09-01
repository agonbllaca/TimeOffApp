const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");

const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "An employee must have a  Username"],
    //validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  firstName: {
    type: String,
    required: [true, "An employee must have a  First Name"],
    //validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  lastName: {
    type: String,
    required: [true, "An employee must have a  Last Name"],
    //validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  employeeType: {
    type: String,
    required: [true, "An employee must have a  job type"],
    //validate: [validator.isAlpha, 'Tour name must only contain characters']
  },
  employeeManager: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    default: null,
    //[true, "Review must belong to a user"],
  },
  role: {
    type: String,
    enum: ["admin", "employee", "manager"],
    default: "employee",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  ptoDays: {
    type: Number,
    default: Math.round(((12 - (new Date().getMonth() + 1)) * 20) / 12),
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
    min: 0,
    max: 20,
  },
  sickLeaveDays: {
    type: Number,
    default: Math.round(((12 - (new Date().getMonth() + 1)) * 20) / 12),
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
    min: 0,
    max: 20,
  },
  carryPtoDays: {
    type: Number,
    default: 0,
    validate: {
      validator: Number.isInteger,
      message: "{VALUE} is not an integer value",
    },
    min: 0,
    max: 10,
  },
  lastChangedDate: {
    type: Date,
    default: Date.now(),
  },
});

//middleware to encrypt the password before saving to DB
userSchema.pre("save", async function(next) {
  //Only run this function if password is modified
  //if (!this.isModified("password")) return next();
  //Asyncronus version , Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  next();
});

userSchema.pre("save", function(next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.lastChangedDate = Date.now() - 1000;
  next();
});


userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  //candidatePassword is provided by user and is not encrypted , userPassword is encrypted and compare method helps use compare these 2 values.
  return await bcrypt.compare(candidatePassword, userPassword);
};


const User = mongoose.model("User", userSchema);
module.exports = User;
