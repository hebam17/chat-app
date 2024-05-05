const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { validationResult } = require("express-validator");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
require("dotenv").config();

// REGISTER
const register = async (req, res) => {
  try {
    const { username, password, profile, email } = req.body;

    const errors = validationResult(req);

    const result = errors.formatWith((error) => {
      return { [error.path]: error.msg };
    });
    const errorsArr = result.array({ onlyFirstError: true });
    if (errorsArr.length) {
      return res.status(400).send({ error: errorsArr });
    }
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

    // not sending token because the user will be redirected to the login page after registeration
    return res.status(201).send({
      message: "User Register Successfully",
      id: newUser._id,
    });
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
    const user = await User.findOne({ username }).populate("conv");
    if (!user) {
      return res.status(404).send({ error: "Username is not found!" });
    }

    bcrypt
      .compare(password, user.password)
      .then(async (passwordCheck) => {
        if (!passwordCheck)
          return res.status(404).send({ error: "Password doesn't match" });

        const accessToken = jwt.sign(
          {
            userId: user._id,
            username: user.username,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "2m" }
        );

        const refreshToken = jwt.sign(
          {
            userId: user._id,
            username: user.username,
          },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "24h" }
        );

        return res
          .status(200)
          .cookie("token", refreshToken, {
            sameSite: "none",
            secure: true,
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // cookie expire in 1day like the refresh token
          })
          .json({ message: "Login Successfully", accessToken });
      })
      .catch((err) =>
        res.status(400).send({ error: "Password doesn't match" })
      );
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry, an error occured, please try again later!" });
  }
};

const refresh = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.status(401).send({ message: "Unauthorized" });

  const refreshToken = cookies.token;

  if (refreshToken) {
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      {},
      async (err, userData) => {
        if (err) return res.status(403).send({ error: "Forbidden" });

        const user = await User.findOne({
          username: userData.username,
        });

        if (!user) return res.status(401).send({ error: "Unauthorized" });

        const accessToken = jwt.sign(
          {
            userId: user._id,
            username: user.username,
          },
          process.env.ACCESS_TOKEN_SECRET,
          { expiresIn: "2m" }
        );
        return res.json({ accessToken });
      }
    );
  } else {
    return res
      .status(401)
      .send({ error: "you are not logged in, please login first" });
  }
};

const logout = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.token) return res.status(204);
  res
    .status(200)
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    })
    .json("ok");
};

const getUser = async (req, res) => {
  const { username } = req.user;
  const { id: profileId } = req.params;

  // check if user already exist
  const user = await User.findOne({ username }).populate("conv");
  if (!user) {
    return res.status(404).send({ error: "User is not found!" });
  }

  if (userId !== profileId) {
    return res.status(200).send({ user });
  } else {
    // for each user => get every conversation's (messages number - unread messages number - last message text - last message creation date)

    const convsInfo = await Message.aggregate([
      {
        $match: {
          conv: {
            $in: convsList,
          },
        },
      },
      {
        $sort: {
          createdAt: 1,
        },
      },
      {
        $group: {
          _id: "$conv",
          lastMessage: {
            $last: "$text",
          },
          lastDate: {
            $last: "$createdAt",
          },
          messagesNum: {
            $sum: 1,
          },
          unReadMessagesNum: {
            $sum: {
              $cond: {
                if: {
                  $in: [user._id, "$read"],
                },
                then: 0,
                else: 1,
              },
            },
          },
        },
      },
    ]);

    let convsAndInfo = user.conv.map((item) => {
      let convInfo = convsInfo.find(
        (info) => String(info._id) === String(item._id)
      );
      return Object.assign(item._doc, { info: convInfo });
    });

    res.status(200).send({
      id: user._id,
      conv: convsAndInfo || [],
      friends: user.friends,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username } = req.user;
    if (username) {
      const data = req.body;

      const newUser = await User.updateOne({ username }, data);
      return res.status(201).send({ message: "User updated Successfully!" });
    } else {
      return res.status(401).send({ error: "User not found!" });
    }
  } catch (error) {
    return res.status(401).send({ error });
  }
};

const generateOTP = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email });

    if (!user) return res.status(404).send({ error: "Can't find user" });

    req.app.locals.OTP = otpGenerator.generate(6, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    return res
      .status(201)
      .send({ code: req.app.locals.OTP, username: user.username });
  } catch (error) {
    return res.status(404).send({ error: "Authentication Error" });
  }
};

const verifyOTP = async (req, res) => {
  const { username, code } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: "No user was found!" });
    if (user && parseInt(req.app.locals.OTP) === parseInt(code)) {
      req.app.locals.OTP = null;
      req.app.locals.resetSession = true;
      return res.status(201).send({ message: "Verify Successfully" });
    } else {
      return res.status(400).send({ error: "Invalide OTP" });
    }
  } catch (error) {
    return res
      .status(400)
      .send({ error: "An error occured, please try again later" });
  }
};

const createResetSession = async (req, res) => {
  if (req.app.locals.resetSession) {
    return res.status(201).send({ flag: req.app.locals.resetSession });
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
            req.app.locals.resetSession = false;
            return res.status(500).send({
              error: "Sorry an error happened, please try again later!",
            });
          });
      })
      .catch((error) => {
        req.app.locals.resetSession = false;
        return res.status(404).send();
      });
  } catch (error) {
    req.app.locals.resetSession = false;
    return res.status(401).send({ error });
  }
};

const authenticate = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ error: "User not found" });
    res.status(200).end();
  } catch (error) {
    return res.status(404).send({ error: "Authentication error" });
  }
};

// get all users
const getAllUsers = async (req, res) => {
  const { convs } = req.body;
  try {
    const users = await User.find({}, { _id: 1, username: 1 });

    // get the last message in every conversation here >>>

    return res.status(200).send({ users });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "an error occured, please try again later!" });
  }
};

exports.register = register;
exports.login = login;
exports.refresh = refresh;
exports.logout = logout;
exports.getUser = getUser;
exports.updateUser = updateUser;
exports.generateOTP = generateOTP;
exports.verifyOTP = verifyOTP;
exports.createResetSession = createResetSession;
exports.resetPassword = resetPassword;
exports.authenticate = authenticate;
exports.getAllUsers = getAllUsers;
