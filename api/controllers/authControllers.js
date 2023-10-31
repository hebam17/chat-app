const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const otpGenerator = require("otp-generator");

// REGISTER
const register = async (req, res) => {
  try {
    const { username, password, profile, email } = req.body;

    if (!(username?.trim() && email?.trim() && password?.trim()))
      return res
        .status(400)
        .send({ error: "please provide all required fields!" });

    // check if user already exist
    const oldUser1 = await User.findOne({ username });
    if (oldUser1) {
      return res.status(400).send({ error: "This username is already exist!" });
    }
    const oldUser2 = await User.findOne({ email });
    if (oldUser2) {
      return res.status(400).send({ error: "Please use a unique email!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      password: hashedPassword,
      email,
      profile: profile || "",
    });

    return res.status(201).json("User Register Successfully");
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!(username?.trim() && password?.trim()))
      return res.status(400).json("please provide all required fields!");

    // check if user already exist
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: "Username is not found!" });
    }

    bcrypt
      .compare(password, user.password)
      .then((passwordCheck) => {
        if (!passwordCheck)
          res
            .status(500)
            .send({ error: "Sorry an error occures please try again!" });

        // Create jwt token
        const token = jwt.sign(
          {
            userId: user._id,
            username: user.username,
          },
          process.env.JWT_SECRET,
          { expiresIn: "24h" }
        );

        return res.status(200).send({
          msg: "Login Successful",
          username: user.username,
          token,
        });
      })
      .catch((err) =>
        res.status(400).send({ error: "Password doesn't match" })
      );
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

const getUser = async (req, res) => {
  const { username } = req.params;
  try {
    if (!username) return res.status(501).send({ error: "Invalid username" });

    const user = await User.findOne({ username }).select("-password -_id");
    if (!user) return res.status(501).send({ error: "Could't find the user" });

    return res.status(201).send(user);
  } catch (err) {
    res.status(404).send({ error: "Cannot Find user data!" });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username } = req.user;
    if (username) {
      const body = req.body;

      const newUSer = await User.updateOne({ username }, body);
      return res.status(201).send({ msg: "User updated Successfully!" });
    } else {
      return res.status(401).send({ error: "User not found!" });
    }
  } catch (err) {
    return res.status(401).send({ error: err });
  }
};

const generateOTP = async (req, res) => {
  const { username } = req.query;
  // const { email } = req.body;
  try {
    // let user = await User.findOne({ username, email });
    let user = await User.findOne({ username });

    if (!user) res.status(404).send({ error: "Can't find user" });

    req.app.locals.OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    return res.status(201).send({ code: req.app.locals.OTP });
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
};

const verifyOTP = async (req, res) => {
  const { code } = req.body;
  console.log(req.app.locals);
  if (parseInt(req.app.locals.OTP) === parseInt(code)) {
    req.app.locals.OTP = null;
    req.app.locals.resetSession = true;
    return res.status(201).send({ msg: "Verify Successfully" });
  }
  return res.status(400).send({ error: "Invalide OTP" });
};

const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    req.app.locals.resetSession = false;
    return res.status(201).send({ error: "Access gruanted" });
  }
  return res.status(404).send({ error: "Session expired" });
};

const resetPassword = async (req, res) => {
  try {
    if (!req.app.locals.resetSession)
      return res.status(404).send({ error: "Session expired" });

    const { username, password } = req.body;
    User.findOne({ username })
      .then((user) => {
        bcrypt
          .hash(password, 10)
          .then((hashedPassword) => {
            User.updateOne({ username }, { password: hashedPassword }).then(
              (data) => {
                req.app.locals.resetSession = false;
                return res
                  .status(201)
                  .send({ message: "User updated Successfully!" });
              }
            );
          })
          .catch((error) => {
            return res.status(500).send({
              error: "Sorry an error happened, please try again later!",
            });
          });
      })
      .catch((error) => {
        return res.status(404).send();
      });
  } catch (error) {
    return res.status(401).send({ error });
  }
};

exports.register = register;
exports.login = login;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.generateOTP = generateOTP;
exports.verifyOTP = verifyOTP;
exports.createResetSession = createResetSession;
exports.resetPassword = resetPassword;
