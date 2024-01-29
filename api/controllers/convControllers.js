const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

const getConv = async (req, res) => {
  const { userId } = req.user;

  try {
    const userConv = await User.findById(userId).populate("conv");
    // console.log("userConv:", userConv.conv);
    return res
      .status(200)
      .json({ convs: userConv.conv, friends: userConv.friends });
  } catch (err) {
    return res
      .status(500)
      .send({ error: "Sorry an error occurred, please try again later!" });
  }
};

const addConv = async (req, res) => {
  const { userId } = req.user;
  const { isPrivate, name, users } = req.body;

  if (!name || users.length === 0) {
    return res.status(403).send({ error: "Please provide the required data!" });
  }

  const user = await User.findById(userId);
  try {
    if (isPrivate && user.friends.includes(users[0])) {
      return res
        .status(403)
        .send({ error: "This user is already in your contacts" });
    }

    const newConv = await Conversation.create({
      isPrivate: isPrivate,
      name,
      users: [...users, userId],
      admin: null,
    });

    if (isPrivate) {
      let otherUser = users[0];
      await User.updateOne(
        { _id: userId },
        { $addToSet: { friends: otherUser, conv: newConv._id } }
      );
      await User.updateOne(
        { _id: otherUser },
        { $addToSet: { friends: userId, conv: newConv._id } }
      );
    }

    if (!isPrivate) {
      [...users, userId].forEach(async (user) => {
        await User.updateOne(
          { _id: user },
          { $addToSet: { conv: newConv._id } }
        );
      });
    }

    return res.status(201).json(newConv);
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Sorry, an error occurred, please try again later!" });
  }
};

const deleteConv = async (req, res) => {
  const { userId } = req.user;
  const { convId } = req.params;

  try {
    if (convId) {
      const conv = await Conversation.findById(convId);

      if (conv.isPrivate) {
        await Conversation.deleteOne({ _id: convId });
        let otherUser = conv.users.filter((user) => user !== userId)[0];
        await User.updateOne(
          { _id: userId },
          { $pull: { friends: otherUser, conv: convId } }
        );
        await User.updateOne(
          { _id: otherUser },
          { $pull: { friends: userId, conv: convId } }
        );

        return res
          .status(200)
          .send("The conversation was successfully removed");
      }

      if (!conv.isPrivate) {
        if (conv.admin !== userId) {
          await User.updateOne({ _id: userId }, { $pull: { conv: convId } });

          return res
            .status(200)
            .send("You are successfully removed from the group");
        }

        await Conversation.deleteOne({ _id: convId });

        [...conv.users, userId].forEach(async (user) => {
          await User.updateOne({ _id: user }, { $pull: { conv: convId } });
        });
      }

      await Message.deleteMany({ conv: convId });

      return res.status(200).json("The conversation was successfully deleted!");
    }
    return res
      .status(403)
      .send({ error: "You must provide a conversation id" });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .send({ error: "Sorry, an error occurred, please try again later!" });
  }
};

exports.getConv = getConv;
exports.addConv = addConv;
exports.deleteConv = deleteConv;
