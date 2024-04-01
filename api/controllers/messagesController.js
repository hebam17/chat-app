const Message = require("../models/Message");

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

exports.getMessages = getMessages;
exports.setRead = setRead;
