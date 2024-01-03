const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/authControllers");
const { Auth, localOTP } = require("../middleware/userAuth");
const registerMail = require("../controllers/mailer");
const { check } = require("express-validator");

// POST ROUTES
router
  .route("/register")
  .post(
    [
      check("email")
        .notEmpty()
        .withMessage("Email is Required!")
        .isEmail()
        .withMessage("This email format is not supported!"),
      check("password")
        .notEmpty()
        .withMessage("password is Required!")
        .isLength({ min: 6, max: 15 })
        .withMessage(
          "password length should be between 6, 15 charachters long!"
        ),
      check("username")
        .notEmpty()
        .withMessage("username is Required!")
        .isLength({ min: 3, max: 30 })
        .withMessage(
          "username length should be between 3, 30 charachters long!"
        )
        .isAlphanumeric()
        .withMessage("only letters and numbers are allowed!"),
      check("profile").isString().withMessage("only strings allowed!"),
    ],
    authControllers.register
  );

router.route("/registerMail").post(registerMail); //send the email

router.route("/authentication").post(authControllers.authenticate); //authenticate user

router.route("/login").post(authControllers.login); //login user

router.route("/logout").post(Auth, authControllers.logout); //logout user

router.route("/generateOTP").post(localOTP, authControllers.generateOTP); //generate random OTP
router.route("/verifyOTP").post(authControllers.verifyOTP); //verify generated OTP

// GET ROUTES
router.route("/profile").get(authControllers.getUser); //profile

router.route("/createResetSession").get(authControllers.createResetSession); //reset all variables
// get all people from db
router.route("/users").get(Auth, authControllers.getAllUsers);

// PUT ROUTES
router.route("/updateuser").put(Auth, authControllers.updateUser); //update user profile
router.route("/resetPassword").put(authControllers.resetPassword); // reset password

module.exports = router;
