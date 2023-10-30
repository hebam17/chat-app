const jwt = require("jsonwebtoken");
require("dotenv").config();

const Auth = async (req, res, next) => {
  try {
    // get the token from the header
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = await jwt.verify(token.process.env.JWT_SECRET);

    req.user = decodedToken;

    next();
  } catch (error) {
    res.status(401).send({ error: "You are not authorized!" });
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
