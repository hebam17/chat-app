const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      req.user = decodedToken;

      next();
    } else {
      return res.status(401).send({ error: "You are already logged out!" });
    }
  } catch (error) {
    return res.status(401).send({ error: "You are not authorized!" });
  }
};

const localOTP = (req, res, next) => {
  req.app.locals = {
    OTP: null,
    resetSession: false,
  };

  next();
};

exports.localOTP = localOTP;
exports.Auth = Auth;
