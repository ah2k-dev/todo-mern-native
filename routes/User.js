import express from "express";
import {
  addTask,
  forgotPassword,
  getProfile,
  login,
  logout,
  register,
  removeTask,
  resetPassword,
  updatePassword,
  updateProfile,
  updateTask,
  verify,
} from "../controllers/user.js";
import { isAuthenticated } from "../middleware/auth.js";
const router = express.Router();
router.route("/register").post(register);
router.route("/verify").post(isAuthenticated, verify);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/new_task").post(isAuthenticated, addTask);
router.route("/me").get(isAuthenticated, getProfile);
// router.route('/tas')
router
  .route("/task/:taskId")
  .get(isAuthenticated, updateTask)
  .delete(isAuthenticated, removeTask);

router.route("/update_profile").post(isAuthenticated, updateProfile)
router.route("/update_password").put(isAuthenticated, updatePassword)
router.route("/forgeot_password").post(forgotPassword)
router.route("/reset_password").put(resetPassword)
export default router;
