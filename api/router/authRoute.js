const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");

// POST ROUTES
router.route("/register").post(authControllers.register);

router.route("/registerMail").post((req, res) => {
  res.json("registerMail route!");
}); //send the email

router.route("/authentication").post((req, res) => {
  res.json("authentication route!");
}); //authenticate user

router.route("/login").post((req, res) => {
  res.json("login route!");
}); //login user

// GET ROUTES
router.route("/user/:username").get(); //profile
router.route("/generateOTP").get(); //generate random OTP
router.route("/verifyOTP").get(); //verify generated OTP
router.route("/createResetSession").get(); //reset all variables

// PUT ROUTES
router.route("/updateuser").put(); //update user profile
router.route("/resetPassword").put(); // set password

module.exports = router;
