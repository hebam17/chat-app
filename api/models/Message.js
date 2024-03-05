const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conv: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    text: String,
    read: { type: Boolean, default: false },
    file: String,
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", MessageSchema);

module.exports = Message;
