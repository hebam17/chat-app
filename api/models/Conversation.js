const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    isPrivate: { type: Boolean, default: true },
    name: {
      type: String,
      unique: [true, "Please provide a unique name"],
    },
    // users: [{ userId: {}, TotalUnread: { type: Number } }],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timeseries: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
