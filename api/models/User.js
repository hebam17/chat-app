const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      require: [true, "please provide a valid username"],
      unique: [true, "Please provide a unique username"],
    },
    password: {
      type: String,
      require: [true, "please provide a password"],
      unique: [false],
    },
    email: {
      type: String,
      require: [true, "please provide an email"],
      unique: [true],
    },
    firstName: { type: String },
    lastName: { type: String },
    mobile: { type: Number },
    address: { type: String },
    profile: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
