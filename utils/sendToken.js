export const sendToken = (res, user, status, msg) => {
  const token = user.getJWTToken();
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    tasks: user.tasks,
    verified: user.verified,
  };
  const options = {
    httpOnly: true,
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXP * 24 * 60 * 60 * 1000
    ),
  };
  res
    .status(status)
    .cookie("token", token, options)
    .json({ success: true, message: msg, user: userData });
};
