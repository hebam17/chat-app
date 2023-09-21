const express = require("express");

const app = express();
require("dotenv").config();

app.get("/test", (req, res) => {
  res.json("test ok");
});

const port = process.env.PORT || 8800;
app.listen(port, () => {
  console.log(`server is running on port 8800!`);
});
