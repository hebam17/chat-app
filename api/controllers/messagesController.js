const Message = require("../models/Message");

const getMessages = async (req, res) => {
  const { contactId } = req.params;
  const { userId } = req.user;

  try {
    if (contactId && userId) {
      const messages = await Message.find({
        sender: { $in: [userId, contactId] },
        recipient: { $in: [userId, contactId] },
      });

      return res.status(200).json(messages);
    }
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

exports.getMessages = getMessages;
