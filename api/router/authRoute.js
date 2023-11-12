const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const { Auth, localOTP } = require("../middleware/userAuth");
const registerMail = require("../controllers/mailer");

// POST ROUTES
router.route("/register").post(authControllers.register);

router.route("/registerMail").post(registerMail); //send the email

router.route("/authentication").post(authControllers.authenticate); //authenticate user

router.route("/login").post(authControllers.login); //login user

router.route("/generateOTP").post(localOTP, authControllers.generateOTP); //generate random OTP
router.route("/verifyOTP").post(authControllers.verifyOTP); //verify generated OTP

// GET ROUTES
router.route("/user/:username").get(authControllers.getUser); //profile

router.route("/createResetSession").get(authControllers.createResetSession); //reset all variables

// PUT ROUTES
router.route("/updateuser").put(Auth, authControllers.updateUser); //update user profile
router.route("/resetPassword").put(authControllers.resetPassword); // reset password

module.exports = router;
