const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authRouter = require("./router/authRoute");

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

app.disable("x-powered-by");

// ROUTES
app.use("/api", authRouter);

mongoose
  .connect(process.env.MONGO_URL)
  .catch((error) => console.log("ERROR:", error));

const jwtSecret = process.env.JWT_SECRET;

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`server is running on http://localhost:8800 !`);
});
