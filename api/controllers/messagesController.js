const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");

const getMessages = async (req, res) => {
  const { convId } = req.params;

  try {
    if (convId) {
      const messages = await Message.find({
        conv: convId,
      });

      return res.status(200).json(messages);
    }
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

// set all unread messages to be read by the user
const setRead = async (req, res) => {
  const { convId } = req.params;
  const { userId } = req.user;

  try {
    await Message.updateMany(
      { conv: convId, read: { $nin: [userId] } },
      { $addToSet: { read: userId } }
    );

    return res.status(200).send({ message: "Messages updated!" });
  } catch (error) {
    return res
      .status(500)
      .send({ error: "Something went wrong please try again later!" });
  }
};

const deleteMessage = async (req, res) => {
  const { convId, messageId } = req.params;
  const { userId } = req.user;

  try {
    if (convId && messageId) {
      const user = await User.findById(userId);

      if (user && user.conv.includes(convId)) {
        console.log("Yes");
        const message = await Message.deleteOne({
          _id: messageId,
          conv: convId,
        });
        console.log(message);
        return res.status(200).send("The message was deleted Successfully");
      }
    }
    return res.status(404).send("Please provide all required data");
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

exports.getMessages = getMessages;
exports.deleteMessage = deleteMessage;
exports.setRead = setRead;
