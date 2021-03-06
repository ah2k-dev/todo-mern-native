import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password > 8 chars"],
    select: false,
  },
  avatar: {
    public_id: String,
    url: String,
  },
  tasks: [
    {
      title: String,
      description: String,
      completed: Boolean,
      createdAt: Date,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: Number,
  otp_expiry: Date,
  resetOtp: Number,
  resetOtp_expiry: Date,
});

//hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//jwtToken
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000,
  });
};

//compare password
userSchema.methods.comparePassword = async function (password) {
  console.log(password, this.password)
  return await bcrypt.compare(password, this.password);
};
//delete if otp not given
userSchema.index({otp_expiry:1},{expireAfterSeconds: 0})
export const User = mongoose.model("User", userSchema);
