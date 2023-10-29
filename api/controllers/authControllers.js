const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

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

exports.register = register;
exports.login = login;
exports.getUser = getUser;

// 2:15h
