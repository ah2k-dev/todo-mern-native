import { User } from "../models/users.js";
import { sendMail } from "../utils/sendMail.js";
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary";
import fs from "fs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const avatar = req.files.avatar.tempFilePath;

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "Duplicate user" });
    }
    const otp = Math.floor(Math.random() * 1000000);
    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "todoNative",
    });
    fs.rmSync("./tmp", { recursive: true });
    user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      otp,
      otp_expiry: new Date(Date.now() + process.env.OTP_EXP * 60 * 1000),
    });
    await sendMail(email, "Verification", `Your otp: ${otp}`);
    sendToken(res, user, 201, "Verification required. OTP sent to: " + email);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const otp = Number(req.body.otp);
    const user = await User.findById(req.user._id);
    if (user.otp !== otp || user.otp_expiry < Date.now()) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or expired" });
    }
    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;
    await user.save();
    sendToken(res, user, 200, "Account verified");
  } catch (error) {}
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // const { avatar } = req.files;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Enter all fields" });
    }
    const isMAtch = await user.comparePassword(password);
    if (!isMAtch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Email or Password" });
    }
    sendToken(res, user, 200, "Logged In");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
//logout
export const logout = async (req, res) => {
  try {
    return res
      .status(200)
      .cookie("token", null, {
        expires: new Date(Date.now()),
      })
      .json({ success: true, message: "Logged out" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//add task
export const addTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const user = await User.findById(req.user.id);
    user.tasks.push({
      title,
      description,
      completed: false,
      createdAt: new Date(Date.now()),
    });
    await user.save();
    res.status(200).json({ success: true, message: "Task added sucessfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//remove task
export const removeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user.id);
    user.tasks = user.tasks.filter(
      (task) => task._id.toString() !== taskId.toString()
    );

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Task deleted sucessfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const user = await User.findById(req.user.id);
    user.task = user.tasks.find(
      (task) => task._id.toString() === taskId.toString()
    );
    user.task.completed = !user.task.completed;

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Task updated sucessfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//get profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    sendToken(res, user, 201, "Welcom Back" + user.name);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// update profile
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const { name } = req.body;
    const avatar = req.files.avatar.tempFilePath;
    if (name) {
      user.name = name;
    }
    if (avatar) {
      await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      const myCloud = await cloudinary.v2.uploader.upload(avatar, {
        folder: "todoNative",
      });
      fs.rmSync("./tmp", { recursive: true });
      user.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    await user.save();
    // if (avatar) {}
    res.status(200).json({ success: true, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
// update password
export const updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Enter all fields" });
    }
    const isMAtch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Old Password" });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password Updated" });
  } catch (error) {
    res.status(500).json({ success: true, message: "Profile updated" });
  }
};

//forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Enter all fields" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User doesn't exist" });
    }
    const otp = Math.floor(Math.random() * 1000000);
    user.resetOtp = otp;
    user.resetOtp_expiry = Date.now() * 10 * 60 * 1000;
    await sendMail(email, "Verification", `Your reset password otp: ${otp}`);
    await user.save();
    res.status(200).json({ success: true, message: "OTP sent to: " + email });
  } catch (error) {
    res.status(500).json({ success: true, message: "Profile updated" });
  }
};

//reset password
export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP required" });
    }
    const user = await User.findOne({
      resetOtp: otp,
      resetOtp_expiry: { $gt: Date.now() },
    }).select("+password");
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or incorrect" });
    }
    user.resetOtp = null;
    user.resetOtp_expiry = null;
    user.password = newPassword;
    await user.save();
    res.status(200).json({ success: true, message: "Password changed" });
  } catch (error) {
    res.status(500).json({ success: true, message: "Profile updated" });
  }
};
