const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
require("dotenv").config();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);

mongoose
  .connect(process.env.MONGO_URL)
  .catch((error) => console.log("ERROR:", error));
const jwtSecret = process.env.JWT_SECRET;

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.get("/profile", (req, res) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwtSecret, {}, (err, userData) => {
      if (err) throw err;
      res.json(userData);
    });
  } else {
    res.status(401).json("not authorized!");
  }
});

app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const newUser = await User.create({ username, password });
    jwt.sign({ userId: newUser.id }, jwtSecret, {}, (err, token) => {
      res.cookie("token", token).status(201).json({ id: newUser._id });
    });
  } catch (err) {
    console.log(err.message);
    res.status(500).json("sorry an error occured");
  }
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`server is running on port 8800!`);
});
