const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = (req, res, next) => {
  try {
    const auth = req.headers.authorization || req.headers.Authorization;
    console.log("auth:", auth);
    if (auth.startsWith("Bearer ")) {
      const token = auth.split(" ")[1];

      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

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

// 4:33
