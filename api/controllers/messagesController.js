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

exports.getMessages = getMessages;
