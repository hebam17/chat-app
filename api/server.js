const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const Message = require("./models/Message");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const authRouter = require("./router/authRoute");
const ws = require("ws");

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

const server = app.listen(port, () => {
  console.log(`server is running on http://localhost:${port} !`);
});

const wss = new ws.WebSocketServer({ server });
wss.on("connection", (connection, req) => {
  const cookies = req.headers?.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    // console.log(tokenCookieString);
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        console.log(token);
        jwt.verify(token, process.env.JWT_SECRET, {}, (err, userData) => {
          if (err) throw err;
          // console.log(userData);
          const { userId, username } = userData;

          connection.userId = userId;
          connection.username = username;
        });
      }
    }
  }

  // Send the online users list to every online user
  const clients = [...wss.clients];
  clients.forEach((client) => {
    client.send(
      JSON.stringify({
        online: clients.map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;
    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients]
        .filter((user) => user.userId === recipient)
        .forEach((user) =>
          user.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient,
              id: messageDoc._id,
            })
          )
        );
    }
  });
});
